"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { CATEGORIES, mapFirestoreDocToBook } from "@/lib/books"
import { BookCard } from "@/components/books/book-card"
import { cn } from "@/lib/utils"
import { useCollection } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { Skeleton } from "@/components/ui/skeleton"

function CategoriesContent() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get("cat") || "Tous"
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const db = useFirestore()

  useEffect(() => {
    const cat = searchParams.get("cat")
    if (cat) setSelectedCategory(cat)
  }, [searchParams])

  const booksQuery = useMemo(() => {
    if (!db) return null;
    const coll = collection(db, "livres");
    if (selectedCategory !== "Tous") {
      return query(coll, where("category", "==", selectedCategory));
    }
    return coll;
  }, [db, selectedCategory]);

  const { data: booksDocs, loading, error } = useCollection(booksQuery);

  const filteredBooks = useMemo(() => {
    if (!booksDocs) return [];
    return booksDocs.map(mapFirestoreDocToBook);
  }, [booksDocs]);

  return (
    <div className="flex-1 px-6 py-10 space-y-8 animate-fade-in max-w-7xl mx-auto w-full">
      <div className="space-y-1">
        <h1 className="font-headline font-bold text-5xl tracking-tight text-[#0b3d91]">Catégories</h1>
        <p className="text-slate-400 text-sm">Explorez par thème</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
              selectedCategory === cat 
                ? "bg-[#0b3d91] text-white shadow-lg" 
                : "bg-secondary/40 text-slate-600 hover:bg-secondary/60"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full rounded-[1.5rem]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
         <div className="col-span-full py-20 text-center text-muted-foreground">
          Une erreur est survenue lors du chargement.
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="col-span-full py-20 text-center text-muted-foreground">
          Aucun livre trouvé dans cette catégorie.
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Skeleton className="h-20 w-20 rounded-full" /></div>}>
        <CategoriesContent />
      </Suspense>
      <BottomNav />
    </main>
  )
}
