
"use client"

import { use, useMemo, useState } from "react"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { mapFirestoreDocToBook } from "@/lib/books"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, Share2, Download, Loader2, BookOpen } from "lucide-react"
import { useDoc, useUser, useFirestore, useCollection } from "@/firebase"
import { doc, collection, addDoc, serverTimestamp, query, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { SimilarBooks } from "@/components/books/similar-books"

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useFirestore()
  const { user } = useUser()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  // Récupérer les détails du livre
  const bookRef = useMemo(() => (db && id ? doc(db, "livres", id) : null), [db, id])
  const { data: bookDoc, loading: bookLoading } = useDoc(bookRef)

  // Vérifier si l'utilisateur possède déjà le livre
  const purchaseQuery = useMemo(() => {
    if (!db || !user || !id) return null;
    return query(collection(db, "purchases"), where("userId", "==", user.uid), where("bookId", "==", id));
  }, [db, user, id]);
  const { data: purchases, loading: purchaseLoading } = useCollection(purchaseQuery);
  const isPurchased = useMemo(() => purchases && purchases.length > 0, [purchases]);

  const book = useMemo(() => (bookDoc ? mapFirestoreDocToBook(bookDoc) : null), [bookDoc])

  const handleAction = async () => {
    // Si déjà acheté, on redirige directement vers le lecteur
    if (isPurchased) {
      router.push(`/read/${id}`);
      return;
    }

    if (!book?.s3_pdf_path) {
      toast({ variant: "destructive", title: "Erreur", description: "Fichier PDF manquant." });
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch("https://aspirateur-livres.onrender.com/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3_pdf_path: book.s3_pdf_path })
      });

      if (!response.ok) throw new Error("Erreur réseau");
      const data = await response.json();

      if (data.url) {
        if (user && db && !isPurchased) {
          addDoc(collection(db, "purchases"), {
            userId: user.uid,
            bookId: id,
            paid: true,
            paymentId: `free_dl_${Date.now()}`,
            created_at: serverTimestamp()
          });
        }

        toast({ title: "Livre prêt", description: "Ouverture du lecteur..." });
        router.push(`/read/${id}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le serveur est en cours de réveil. Veuillez réessayer.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (bookLoading || purchaseLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-background">
        <Skeleton className="h-[450px] w-full" />
        <div className="px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
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

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="relative h-[450px] w-full animate-fade-in">
        <Image src={book.coverImage} alt={book.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
          <Link href="/" className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center shadow-lg">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <button className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center shadow-lg">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-10">
          <Badge className="bg-accent text-accent-foreground border-none px-3 py-1 text-[10px] font-bold uppercase mb-3">
            {book.category}
          </Badge>
          <h1 className="font-headline font-bold text-3xl leading-tight mb-2">{book.title}</h1>
          <p className="text-muted-foreground font-medium">{book.author}</p>
        </div>
      </div>

      <div className="px-6 py-4 space-y-8 animate-slide-up">
        <div className="flex items-center justify-between p-4 rounded-3xl bg-secondary/30 border border-border/50">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              {isPurchased ? "Dans votre bibliothèque" : "Accès Libre"}
            </p>
            <p className={`text-2xl font-bold uppercase ${isPurchased ? "text-accent" : "text-primary"}`}>
              {isPurchased ? "Acquis" : "Gratuit"}
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleAction}
            disabled={isProcessing}
            className={`rounded-2xl px-6 gap-2 ${
              isPurchased 
                ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                : "bg-[#0b3d91] hover:bg-[#0b3d91]/90"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : isPurchased ? (
              <BookOpen className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isPurchased ? "Lire maintenant" : "Télécharger"}
          </Button>
        </div>

        <section className="space-y-4">
          <h2 className="font-headline font-bold text-lg">Résumé du livre</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{book.description}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {book.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-[11px] font-medium">#{tag}</span>
            ))}
          </div>
        </section>

        <Button variant="outline" className="w-full h-14 rounded-2xl gap-2 border-primary/20 text-primary group" onClick={handleAction}>
          Aperçu des premières pages
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        <SimilarBooks book={book} />
        <div className="h-20" />
      </div>

      <BottomNav />
    </main>
  )
}
