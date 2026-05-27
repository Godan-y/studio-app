
"use client"

import { useMemo } from "react"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import { ShoppingBag, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useUser, useAuth } from "@/firebase"
import { collection, query, where, documentId } from "firebase/firestore"
import { mapFirestoreDocToBook } from "@/lib/books"
import { BookCard } from "@/components/books/book-card"
import { Skeleton } from "@/components/ui/skeleton"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { toast } from "@/hooks/use-toast"

export default function MyBooksPage() {
  const { user, loading: userLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()

  // 1. Récupérer les IDs des livres achetés depuis la collection 'purchases'
  const purchasesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "purchases"), where("userId", "==", user.uid), where("paid", "==", true));
  }, [db, user]);

  const { data: purchasesDocs, loading: purchasesLoading } = useCollection(purchasesQuery);

  const purchasedBookIds = useMemo(() => {
    if (!purchasesDocs || purchasesDocs.length === 0) return [];
    return Array.from(new Set(purchasesDocs.map(doc => doc.data().bookId)));
  }, [purchasesDocs]);

  // 2. Récupérer les détails de ces livres
  const booksQuery = useMemo(() => {
    if (!db || purchasedBookIds.length === 0) return null;
    return query(collection(db, "livres"), where(documentId(), "in", purchasedBookIds.slice(0, 10)));
  }, [db, purchasedBookIds]);

  const { data: booksDocs, loading: booksLoading } = useCollection(booksQuery);

  const myBooks = useMemo(() => {
    if (!booksDocs) return [];
    return booksDocs.map(mapFirestoreDocToBook);
  }, [booksDocs]);

  const handleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast({
        title: "Heureux de vous revoir !",
        description: "Accès à votre bibliothèque activé.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  }

  const isLoading = userLoading || purchasesLoading || (purchasedBookIds.length > 0 && booksLoading);

  return (
    <main className="flex flex-col min-h-screen bg-background pb-20 md:pb-10">
      <Header />
      
      <div className="flex-1 px-6 md:px-12 py-10 space-y-8 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="space-y-1">
          <h1 className="font-headline font-bold text-5xl tracking-tight text-[#0b3d91] dark:text-white">Mes Livres</h1>
          <p className="text-slate-400 text-sm font-medium">
            {isLoading ? "Chargement..." : `${myBooks.length} livre${myBooks.length > 1 ? 's' : ''} dans votre bibliothèque`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-[2rem]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] border border-slate-100 dark:border-border bg-slate-50/30 dark:bg-card/30 text-center space-y-8">
            <div className="w-20 h-20 bg-[#0b3d91] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/20">
              <LogIn className="w-10 h-10" />
            </div>
            <div className="space-y-3 max-w-sm">
              <h2 className="font-headline font-bold text-2xl text-[#0b3d91] dark:text-white">Votre espace personnel</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Connectez-vous pour retrouver vos achats et explorer l'intégralité de notre collection premium.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button onClick={handleAuth} className="rounded-2xl bg-[#0b3d91] h-14 px-10 font-bold gap-3 shadow-lg transition-all hover:scale-105">
                <LogIn className="w-5 h-5" />
                Se connecter
              </Button>
              <Button onClick={handleAuth} variant="outline" className="rounded-2xl border-[#0b3d91] text-[#0b3d91] h-14 px-10 font-bold gap-3 transition-all hover:scale-105">
                <UserPlus className="w-5 h-5" />
                S'inscrire
              </Button>
            </div>
          </div>
        ) : myBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-4">
            {myBooks.map((book) => (
              <BookCard key={book.id} book={book} isPurchased={true} />
            ))}
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] border border-slate-100 dark:border-border bg-slate-50/30 dark:bg-card/30 transition-all">
            <div className="space-y-8 flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 bg-[#0b3d91] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/20">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="font-headline font-bold text-2xl text-[#0b3d91] dark:text-white">Bibliothèque vide</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Votre collection attend son premier chef-d'œuvre. Explorez nos nouveautés !
                </p>
              </div>
              <Link href="/" passHref className="w-full sm:w-auto">
                <Button className="w-full sm:px-10 h-16 rounded-2xl bg-[#0b3d91] hover:bg-[#0b3d91]/90 gap-3 text-lg font-bold shadow-xl transition-all hover:scale-105">
                  <ShoppingBag className="w-5 h-5" />
                  Parcourir le catalogue
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
