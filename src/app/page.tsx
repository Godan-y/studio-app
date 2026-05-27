"use client"

import { useMemo } from "react"
import { BottomNav } from "@/components/layout/bottom-nav"
import { BookCard } from "@/components/books/book-card"
import { Input } from "@/components/ui/input"
import { Search, Bell, Moon, Briefcase, Code, Book as BookIcon, Sparkles, ChevronRight, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { mapFirestoreDocToBook } from "@/lib/books"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORY_ITEMS = [
  { name: "Business", icon: Briefcase, color: "bg-blue-600", textColor: "text-blue-600" },
  { name: "Informatique", icon: Code, color: "bg-purple-600", textColor: "text-purple-600" },
  { name: "Roman", icon: BookIcon, color: "bg-orange-600", textColor: "text-orange-600" },
  { name: "Développement personnel", icon: Sparkles, color: "bg-teal-600", textColor: "text-teal-600" },
]

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const db = useFirestore()

  const booksQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "livres"), orderBy("created_at", "desc"), limit(10));
  }, [db]);

  const { data: booksDocs, loading, error } = useCollection(booksQuery);

  const books = useMemo(() => {
    if (!booksDocs) return [];
    return booksDocs.map(mapFirestoreDocToBook);
  }, [booksDocs]);

  return (
    <main className="flex flex-col min-h-screen bg-background pb-20 md:pb-10 scroll-smooth">
      <div className="hidden md:flex justify-end gap-3 px-12 pt-8">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-slate-600 hover:bg-secondary transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-slate-600 hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 md:px-12 py-6 space-y-10 max-w-7xl mx-auto w-full animate-fade-in">
        <header className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Bibliothèque numérique</p>
          <div className="flex items-baseline gap-2">
            <h1 className="font-headline font-bold text-4xl text-[#0b3d91] dark:text-white">Bonjour</h1>
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="font-headline font-bold text-3xl text-[#0b3d91] dark:text-white">Découvrez de nouveaux livres</h2>
          <p className="text-sm text-slate-400">La bibliothèque numérique de la RDC</p>
        </header>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0b3d91] transition-colors" />
          <Input 
            placeholder="Rechercher un livre, auteur..." 
            className="w-full h-14 pl-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-2 focus-visible:ring-[#0b3d91]/20 text-base"
          />
        </div>

        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#0b3d91] via-[#0b3d91] to-[#1e4ea3] p-8 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-md space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/20">
              Offre du moment
            </span>
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-4xl leading-tight">Bibliothèque illimitée</h3>
              <p className="text-white/70 text-sm font-medium">-30% sur l'abonnement annuel</p>
            </div>
            <Link href="#latest-publications">
              <Button className="bg-[#c7a54b] hover:bg-[#b09240] text-white rounded-full px-8 h-12 font-bold transition-transform hover:scale-105">
                Découvrir
              </Button>
            </Link>
          </div>
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <BookIcon className="w-80 h-80 rotate-12" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-2xl text-[#0b3d91] dark:text-white">Catégories</h3>
            <Link href="/categories" className="text-xs font-bold text-[#0b3d91]/60 dark:text-white/60 hover:text-[#0b3d91] flex items-center gap-1">
              Tout voir <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible no-scrollbar">
            {CATEGORY_ITEMS.map((cat) => (
              <Link 
                key={cat.name} 
                href={`/categories?cat=${cat.name}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-sm hover:shadow-md hover:border-[#0b3d91]/10 transition-all group shrink-0 min-w-[170px] md:min-w-0"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="font-headline font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section id="latest-publications" className="space-y-8 pt-4">
          <h2 className="font-headline font-bold text-2xl text-[#0b3d91] dark:text-white">Dernières publications</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-[1.5rem]" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-muted-foreground">
              Une erreur est survenue lors du chargement des livres.
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Aucun livre trouvé dans la bibliothèque.
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
