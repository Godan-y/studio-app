"use client"

import { useEffect, useState } from "react"
import { Book } from "@/lib/books"
import { recommendSimilarBooks, SimilarBooksRecommendationOutput } from "@/ai/flows/similar-books-recommendation-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"

interface SimilarBooksProps {
  book: Book
}

export function SimilarBooks({ book }: SimilarBooksProps) {
  const [recommendations, setRecommendations] = useState<SimilarBooksRecommendationOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const result = await recommendSimilarBooks({
          bookTitle: book.title,
          bookDescription: book.description,
          bookCategories: [book.category],
          bookAuthor: book.author
        })
        setRecommendations(result)
      } catch (error) {
        // Erreur gérée par le système global ou ignorée silencieusement pour l'UX
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [book])

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <h2 className="font-headline font-semibold">Suggestions pour vous</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!recommendations || recommendations.similarBooks.length === 0) return null

  return (
    <div className="space-y-6 mt-10 animate-fade-in">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="font-headline font-bold text-lg">Livres similaires recommandés</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {recommendations.similarBooks.map((rec, index) => (
          <div 
            key={index} 
            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 group hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-headline font-semibold text-sm">{rec.title}</h3>
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Suggestion IA</span>
            </div>
            {rec.author && <p className="text-[11px] text-muted-foreground mt-0.5">{rec.author}</p>}
            <p className="text-xs mt-2 text-foreground/80 leading-relaxed italic">
              &quot;{rec.reason}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
