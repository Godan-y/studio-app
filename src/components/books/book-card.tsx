"use client"

import Image from "next/image"
import Link from "next/link"
import { Book } from "@/lib/books"
import { Button } from "@/components/ui/button"
import { Eye, Plus, Loader2, Calendar, BookOpen } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

interface BookCardProps {
  book: Book
  isPurchased?: boolean
}

export function BookCard({ book, isPurchased = false }: BookCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const displayImage = book.coverImage || `https://picsum.photos/seed/${book.id}/400/600`;

  useEffect(() => {
    if (book.created_at && typeof (book.created_at as any).toDate === 'function') {
      const createdAtDate = (book.created_at as any).toDate();
      const now = new Date();
      const diffInMinutes = (now.getTime() - createdAtDate.getTime()) / (1000 * 60);
      setIsNew(diffInMinutes < 60);
    }
  }, [book.created_at]);

  const dateFormatted = useMemo(() => {
    if (book.created_at && typeof (book.created_at as any).toDate === 'function') {
      return format((book.created_at as any).toDate(), "d MMMM yyyy", { locale: fr });
    }
    return null;
  }, [book.created_at]);

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPurchased) {
      router.push(`/read/${book.id}`);
      return;
    }

    if (!book.s3_pdf_path) {
      toast({
        variant: "destructive",
        title: "Fichier non disponible",
        description: "Le chemin du PDF est manquant.",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const response = await fetch(
        "https://aspirateur-livres.onrender.com/download",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3_pdf_path: book.s3_pdf_path })
        }
      );

      if (!response.ok) throw new Error("Erreur réseau");
      const data = await response.json();

      if (data.url) {
        if (user && db) {
          await addDoc(collection(db, "purchases"), {
            userId: user.uid,
            bookId: book.id,
            paid: true,
            paymentId: `free_dl_${Date.now()}`,
            created_at: serverTimestamp()
          });
        }

        toast({
          title: "Livre ajouté",
          description: "Ouverture de votre espace de lecture...",
        });
        
        router.push(`/read/${book.id}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le serveur est en cours de réveil. Veuillez réessayer.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group flex flex-col animate-slide-up">
      <Link href={`/books/${book.id}`} className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-lg mb-4">
        <Image 
          src={displayImage} 
          alt={book.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
          data-ai-hint="book cover"
          unoptimized={!displayImage.startsWith('http')}
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        {isNew && (
          <div className="absolute top-3 left-3 bg-[#c7a54b] text-white text-[9px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider z-10 animate-pulse">
            Nouveau
          </div>
        )}
      </Link>
      
      <div className="flex flex-col gap-0.5 px-1">
        <h3 className="font-headline font-bold text-base leading-tight text-[#0b3d91] dark:text-white line-clamp-1">{book.title}</h3>
        <p className="text-[11px] text-muted-foreground/70 font-medium">{book.author}</p>
        
        {dateFormatted && (
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            <Calendar className="w-3 h-3" />
            {dateFormatted}
          </div>
        )}
        
        <p className="font-bold text-[#0b3d91] dark:text-[#c7a54b] text-sm mt-1 mb-3 uppercase tracking-tighter">
          Gratuit
        </p>

        <div className="flex items-center gap-2 mt-2">
          <Button 
            size="sm" 
            onClick={handleAction}
            disabled={isDownloading}
            className={`flex-1 rounded-xl h-10 gap-2 text-[11px] font-bold ${
              isPurchased 
                ? "bg-[#c7a54b] hover:bg-[#b09240] text-white" 
                : "bg-[#0b3d91] hover:bg-[#0b3d91]/90 text-white"
            }`}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPurchased ? (
              <BookOpen className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isPurchased ? "Lire" : "Ajouter"}
          </Button>
          <Link href={`/books/${book.id}`} passHref>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full bg-secondary/50 border-none hover:bg-secondary flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
