"use client"

import { use, useState, useMemo } from "react"
import { ArrowLeft, ShieldCheck, CheckCircle2, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { mapFirestoreDocToBook } from "@/lib/books"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useFirestore()
  const { user } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const bookRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, "livres", id);
  }, [db, id]);

  const { data: bookDoc, loading } = useDoc(bookRef);

  const book = useMemo(() => {
    if (!bookDoc) return null;
    return mapFirestoreDocToBook(bookDoc);
  }, [bookDoc]);

  const handleDownload = async () => {
    if (!book?.s3_pdf_path) {
       toast({
        variant: "destructive",
        title: "Erreur",
        description: "Chemin du fichier PDF manquant.",
      });
      return;
    }
    
    setIsDownloading(true);
    try {
      const response = await fetch(
        "https://aspirateur-livres.onrender.com/download",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            s3_pdf_path: book.s3_pdf_path
          })
        }
      );

      if (!response.ok) {
        throw new Error("Erreur réseau");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        
        // Enregistrer le téléchargement
        if (user && db && book) {
          addDoc(collection(db, "purchases"), {
            userId: user.uid,
            bookId: book.id,
            paid: true,
            paymentId: `free_dl_${Date.now()}`,
            created_at: serverTimestamp()
          });
        }

        setIsSuccess(true);
        toast({
          title: "Téléchargement démarré",
          description: "Le livre a été ajouté à votre bibliothèque.",
        });
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

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-background p-6 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </main>
    )
  }

  if (!book) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p>Livre non trouvé</p>
      <Link href="/">
        <Button variant="outline">Retour à l'accueil</Button>
      </Link>
    </div>
  )

  if (isSuccess) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="font-headline font-bold text-3xl mb-4">Prêt à lire !</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Le téléchargement de <strong>{book.title}</strong> a commencé. Bonne lecture !
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Link href="/" passHref className="w-full">
            <Button size="lg" className="w-full rounded-2xl bg-[#0b3d91] text-white h-14 text-lg font-bold">
              Retour au catalogue
            </Button>
          </Link>
          <Link href="/mes-livres" passHref className="w-full">
            <Button variant="outline" size="lg" className="w-full rounded-2xl h-14 text-lg">
              Ma bibliothèque
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-background pb-32">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-border/50">
        <Link href={`/books/${id}`}>
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-headline font-bold text-xl">Prêt au téléchargement</h1>
      </div>

      <div className="px-6 py-8 space-y-10 animate-fade-in max-w-2xl mx-auto w-full">
        <section className="flex gap-6 p-6 rounded-[2rem] bg-secondary/20 border border-border/50">
          <div className="relative w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-md shrink-0">
            <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h2 className="font-headline font-bold text-lg line-clamp-2">{book.title}</h2>
            <p className="text-xs text-muted-foreground font-medium">{book.author}</p>
            <p className="font-bold text-[#0b3d91] text-2xl mt-2 uppercase">
              Gratuit
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <Button 
            size="lg" 
            className="w-full rounded-[2rem] h-20 text-xl bg-[#0b3d91] text-white hover:bg-[#0b3d91]/90 shadow-xl transition-all hover:scale-[1.02] gap-3"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Download className="w-6 h-6" />
            )}
            {isDownloading ? "Récupération du fichier..." : "Télécharger maintenant"}
          </Button>
          
          <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-card/30 border border-slate-100 dark:border-border flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 italic font-medium">
              Accès instantané. Votre livre sera téléchargé au format PDF haute résolution et enregistré dans votre bibliothèque.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
