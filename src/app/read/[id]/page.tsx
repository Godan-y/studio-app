"use client"

import { use, useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDoc, useUser, useFirestore, useCollection } from "@/firebase"
import { doc, collection, addDoc, setDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore"
import { mapFirestoreDocToBook } from "@/lib/books"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Settings, 
  Bookmark, 
  StickyNote, 
  X, 
  Loader2, 
  Sun, 
  Moon, 
  Coffee,
  Maximize,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  ExternalLink
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

/**
 * Configuration du worker PDF.js.
 * Synchronisé sur la version 4.8.69 pour correspondre à l'API.
 */
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

type ReadingTheme = 'light' | 'dark' | 'sepia'

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  
  const [theme, setTheme] = useState<ReadingTheme>('light')
  const [showSettings, setShowSettings] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfData, setPdfData] = useState<any>(null)
  const [loadingPdf, setLoadingPdf] = useState(true)
  const [renderError, setRenderError] = useState<string | null>(null)
  
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)

  // Récupérer les détails du livre depuis Firestore
  const bookRef = useMemo(() => (db && id ? doc(db, "livres", id) : null), [db, id])
  const { data: bookDoc, loading: bookLoading } = useDoc(bookRef)
  const book = useMemo(() => (bookDoc ? mapFirestoreDocToBook(bookDoc) : null), [bookDoc])

  // Suivi de progression de lecture
  const progressRef = useMemo(() => {
    if (!db || !user || !id) return null
    return doc(db, "reading_progress", `${user.uid}_${id}`)
  }, [db, user, id])
  const { data: progressDoc } = useDoc(progressRef)

  // Récupérer les annotations
  const notesQuery = useMemo(() => {
    if (!db || !user || !id) return null
    return query(
      collection(db, "annotations"),
      where("userId", "==", user.uid),
      where("bookId", "==", id),
      orderBy("createdAt", "desc")
    )
  }, [db, user, id])
  const { data: annotations } = useCollection(notesQuery)

  const fetchBookUrl = useCallback(async () => {
    if (!book?.s3_pdf_path) return
    
    setLoadingPdf(true)
    setRenderError(null)
    try {
      const response = await fetch("https://aspirateur-livres.onrender.com/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3_pdf_path: book.s3_pdf_path })
      })
      
      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`)
      
      const data = await response.json()
      if (data.url) {
        setPdfUrl(data.url)
      } else {
        throw new Error("URL de téléchargement non trouvée")
      }
    } catch (error: any) {
      setRenderError(error.message || "Erreur de connexion")
      setLoadingPdf(false)
    }
  }, [book])

  useEffect(() => {
    if (!pdfUrl) return;

    const loadPdfData = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
        const buffer = await response.arrayBuffer();
        setPdfData({ data: buffer });
        setLoadingPdf(false);
      } catch (err: any) {
        console.error("PDF Load Error:", err);
        setRenderError("Impossible de récupérer le contenu du livre (Erreur CORS ou Réseau)");
        setLoadingPdf(false);
      }
    };

    loadPdfData();
  }, [pdfUrl]);

  useEffect(() => {
    if (book) fetchBookUrl()
  }, [book, fetchBookUrl])

  useEffect(() => {
    if (progressDoc && progressDoc.exists()) {
      const lastPage = progressDoc.data()?.lastPage
      if (lastPage && lastPage !== pageNumber && lastPage <= (numPages || 1000)) {
        setPageNumber(lastPage)
      }
    }
  }, [progressDoc, numPages])

  const saveProgress = useCallback((newPage: number) => {
    if (!progressRef || !user) return
    setDoc(progressRef, {
      userId: user.uid,
      bookId: id,
      lastPage: newPage,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }, [progressRef, user, id])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setRenderError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF Component Error:", error)
    setRenderError(error.message)
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => {
      const next = prev + offset
      if (next >= 1 && next <= numPages) {
        saveProgress(next)
        return next
      }
      return prev
    })
  }

  const handleAddNote = async () => {
    if (!user || !id || !db) return
    const content = prompt("Votre note pour la page " + pageNumber + " :")
    if (!content) return

    addDoc(collection(db, "annotations"), {
      userId: user.uid,
      bookId: id,
      content,
      page: pageNumber,
      type: "note",
      createdAt: serverTimestamp()
    })
    
    toast({ title: "Note enregistrée" })
  }

  if (bookLoading || loadingPdf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Initialisation du lecteur sécurisé...</p>
      </div>
    )
  }

  if (!book || (!pdfUrl && !pdfData)) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 text-center animate-fade-in">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="font-headline font-bold text-xl">Livre indisponible</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">Le serveur de fichiers n'a pas pu générer d'accès sécurisé pour ce document.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl px-8">Retour</Button>
        <Button onClick={fetchBookUrl} className="rounded-xl px-8 bg-[#0b3d91]">Réessayer</Button>
      </div>
    </div>
  )

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col transition-colors duration-500 select-none",
      theme === 'light' && "bg-[#F8F9FA] text-[#1A1A1A]",
      theme === 'dark' && "bg-[#121212] text-[#E0E0E0]",
      theme === 'sepia' && "bg-[#F4ECD8] text-[#5B4636]"
    )}>
      <header className="h-16 flex items-center justify-between px-6 border-b border-border/10 glass-morphism z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="font-headline font-bold text-sm truncate max-w-[200px]">{book.title}</h1>
            <p className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Page {pageNumber} / {numPages || '...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowNotes(!showNotes)} className="rounded-full relative">
            <StickyNote className="w-5 h-5" />
            {annotations && annotations.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toast({ title: "Signet ajouté" })} className="rounded-full">
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => document.documentElement.requestFullscreen()} className="hidden sm:flex rounded-full">
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 relative overflow-auto flex flex-col items-center py-8 px-4 no-scrollbar">
        {renderError ? (
          <div className="flex flex-col items-center justify-center p-10 bg-card rounded-[2rem] border border-border shadow-xl space-y-6 animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
               <AlertTriangle className="w-8 h-8 text-destructive" />
             </div>
             <div className="text-center space-y-2">
               <h3 className="font-headline font-bold text-lg">Erreur d'affichage</h3>
               <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                 {renderError.toLowerCase().includes('fetch') 
                   ? "La sécurité de votre navigateur bloque l'accès au fichier (CORS). Le serveur de stockage doit autoriser l'accès." 
                   : "Le lecteur n'a pas pu traiter ce document."}
               </p>
             </div>
             <div className="flex flex-col gap-3 w-full">
               <Button onClick={fetchBookUrl} className="rounded-2xl gap-2 font-bold h-12 bg-[#0b3d91]">
                 <RefreshCw className="w-4 h-4" /> Réactualiser
               </Button>
               {pdfUrl && (
                 <Button variant="outline" onClick={() => window.open(pdfUrl, '_blank')} className="rounded-2xl gap-2 font-bold h-12">
                   <ExternalLink className="w-4 h-4" /> Ouvrir en direct
                 </Button>
               )}
             </div>
          </div>
        ) : (
          <div className={cn(
            "relative transition-all duration-300 shadow-2xl rounded-sm overflow-hidden",
            theme === 'dark' && "brightness-90 contrast-125"
          )}>
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<Loader2 className="w-10 h-10 animate-spin text-primary my-20" />}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderAnnotationLayer={false}
                renderTextLayer={true}
                className="max-w-full h-auto"
              />
            </Document>
            
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center rotate-[-45deg] z-10 overflow-hidden">
               <div className="text-4xl font-bold whitespace-nowrap uppercase tracking-[1em] select-none">
                 {user?.email || 'LECTEUR PREMIUM'} - MAYELE
               </div>
            </div>
          </div>
        )}

        {!renderError && !loadingPdf && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 glass-morphism px-6 py-3 rounded-full shadow-2xl border border-border/20 z-[60]">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
              className="rounded-full h-10 w-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-xs font-bold">{pageNumber} / {numPages || '...'}</span>
              <div className="w-20 h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => changePage(1)} 
              disabled={pageNumber >= numPages}
              className="rounded-full h-10 w-10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="absolute top-20 right-6 w-64 glass-morphism p-6 rounded-3xl shadow-2xl border border-border/20 z-[60] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm">Affichage</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} className="h-8 w-8 rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase opacity-60">Thème</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  className="rounded-xl h-12 flex flex-col gap-1"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-[9px]">Clair</span>
                </Button>
                <Button 
                  variant={theme === 'sepia' ? 'default' : 'outline'} 
                  className="rounded-xl h-12 flex flex-col gap-1 bg-[#F4ECD8] text-[#5B4636] border-none hover:bg-[#F4ECD8]/80"
                  onClick={() => setTheme('sepia')}
                >
                  <Coffee className="w-4 h-4" />
                  <span className="text-[9px]">Sépia</span>
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  className="rounded-xl h-12 flex flex-col gap-1 bg-[#121212] text-white border-none hover:bg-[#121212]/80"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-[9px]">Nuit</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase opacity-60">Zoom</p>
              <div className="flex items-center gap-3">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</Button>
                 <span className="text-xs font-bold flex-1 text-center">{Math.round(scale * 100)}%</span>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>+</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotes && (
        <div className="absolute top-0 right-0 w-full sm:w-80 h-full glass-morphism shadow-2xl z-[70] animate-in slide-in-from-right duration-300 flex flex-col border-l border-border/10">
          <div className="p-6 flex justify-between items-center border-b border-border/10">
            <h3 className="font-headline font-bold">Annotations</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowNotes(false)} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            <Button className="w-full rounded-2xl gap-2 font-bold mb-4 bg-[#0b3d91]" onClick={handleAddNote}>
              <StickyNote className="w-4 h-4" /> Nouvelle note
            </Button>
            
            {!annotations || annotations.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <p className="text-xs italic">Aucune note pour le moment.</p>
              </div>
            ) : (
              annotations.map((noteDoc: any) => {
                const note = noteDoc.data()
                return (
                  <div key={noteDoc.id} className="p-4 rounded-2xl bg-secondary/30 border border-border/20 space-y-2">
                    <p className="text-xs leading-relaxed italic">&quot;{note.content}&quot;</p>
                    <div className="flex justify-between items-center text-[9px] font-bold opacity-50 uppercase">
                      <span>Page {note.page || '?'}</span>
                      <span>{note.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
