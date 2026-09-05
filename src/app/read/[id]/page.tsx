
"use client"

import { use, useState, useMemo, useEffect } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Moon, Sun, Type, Bookmark, MessageSquare, RefreshCw, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { mapFirestoreDocToBook } from "@/lib/books"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { pdfjs, Document, Page } from "react-pdf"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

interface ReaderSettings {
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  brightness: number;
}

const Watermark = ({ text }: { text: string }) => (
  <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center opacity-[0.03] select-none rotate-[-35deg]">
    <span className="text-8xl font-black uppercase tracking-widest">{text}</span>
  </div>
)

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useFirestore()
  const { user } = useUser()
  
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 100,
    theme: 'light',
    brightness: 100
  })

  const bookRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, "livres", id);
  }, [db, id]);

  const { data: bookDoc, loading: bookLoading } = useDoc(bookRef);
  const book = useMemo(() => (bookDoc ? mapFirestoreDocToBook(bookDoc) : null), [bookDoc]);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!book?.s3_pdf_path) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("https://aspirateur-livres.onrender.com/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3_pdf_path: book.s3_pdf_path })
        });

        if (!response.ok) throw new Error("Impossible de récupérer le lien de téléchargement.");
        
        const data = await response.json();
        if (!data.url) throw new Error("Lien de téléchargement non reçu.");
        
        setPdfUrl(data.url);
        
        // Fetch the PDF as a blob to handle CORS issues more manually
        const pdfResponse = await fetch(data.url);
        if (!pdfResponse.ok) throw new Error("Erreur lors de la récupération du fichier PDF.");
        
        const buffer = await pdfResponse.arrayBuffer();
        setPdfData(buffer);
      } catch (err: any) {
        console.error("Reader Error:", err);
        setError(err.message || "Erreur de chargement du PDF.");
      } finally {
        setLoading(false);
      }
    };

    if (book) fetchPdf();
  }, [book]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    console.error("PDF Load Error:", err);
    setError("Erreur de rendu du PDF. Veuillez réessayer.");
    setLoading(false);
  }

  const handlePageChange = (newPage: number) => {
    if (numPages && newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      // Save progress to Firestore
      if (db && user && id) {
        updateDoc(doc(db, "reading_progress", `${user.uid}_${id}`), {
          lastPage: newPage,
          updatedAt: new Date().toISOString()
        }).catch(() => {}); // Silent fail for progress
      }
    }
  };

  if (loading || bookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Préparation de votre lecture...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Oups !</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">{error}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="rounded-2xl h-12">
            Réessayer
          </Button>
          {pdfUrl && (
            <Button variant="outline" asChild className="rounded-2xl h-12">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Ouvrir en direct <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
          <Link href={`/books/${id}`}>
            <Button variant="ghost">Retour au livre</Button>
          </Link>
        </div>
      </div>
    );
  }

  const theme = settings.theme;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === 'light' ? "bg-white text-slate-900" : 
      theme === 'dark' ? "bg-[#0a0a0a] text-slate-100" : 
      "bg-[#f4ecd8] text-[#5b4636]"
    )}>
      {/* Watermark Security */}
      <Watermark text={user?.email || "MAYELE DIGITAL"} />

      {/* Top Controls */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 h-16 flex items-center justify-between transition-transform duration-300 border-b border-white/5",
        showControls ? "translate-y-0" : "-translate-y-full",
        theme === 'light' ? "bg-white/90" : 
        theme === 'dark' ? "bg-[#0a0a0a]/90" : 
        "bg-[#f4ecd8]/90",
        "backdrop-blur-md"
      )}>
        <div className="flex items-center gap-3">
          <Link href={`/books/${id}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold line-clamp-1 max-w-[200px]">{book?.title}</h1>
            <p className="text-[10px] opacity-60">Page {pageNumber} sur {numPages}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setSettings(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Reader Content */}
      <main 
        className="pt-20 pb-24 px-4 flex flex-col items-center min-h-screen"
        onClick={() => setShowControls(!showControls)}
      >
        <div className={cn(
          "relative shadow-2xl transition-all duration-300",
          theme === 'dark' && "brightness-90 contrast-125"
        )}>
          {pdfData && (
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="flex items-center justify-center p-20"><RefreshCw className="animate-spin" /></div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="max-w-full h-auto"
                width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800}
              />
            </Document>
          )}
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-6 space-y-4 transition-transform duration-300",
        showControls ? "translate-y-0" : "translate-y-full",
        theme === 'light' ? "bg-white/90 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]" : 
        theme === 'dark' ? "bg-[#0a0a0a]/90 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]" : 
        "bg-[#f4ecd8]/90 shadow-[0_-10px_30px_rgba(91,70,54,0.1)]",
        "backdrop-blur-md"
      )}>
        <div className="max-w-screen-md mx-auto space-y-4">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider opacity-60">
            <span>Chapitre Actuel</span>
            <span>{Math.round((pageNumber / (numPages || 1)) * 100)}% terminé</span>
          </div>
          
          <Progress value={(pageNumber / (numPages || 1)) * 100} className="h-1.5" />

          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="secondary" 
              className="rounded-2xl h-12 px-6 gap-2"
              onClick={(e) => { e.stopPropagation(); handlePageChange(pageNumber - 1); }}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Précédent</span>
            </Button>

            <div className="flex-1 flex items-center justify-center font-headline font-bold text-lg">
              {pageNumber} <span className="mx-2 opacity-30 text-sm">/</span> {numPages}
            </div>

            <Button 
              className="rounded-2xl h-12 px-6 gap-2 bg-[#0b3d91] text-white hover:bg-[#0b3d91]/90"
              onClick={(e) => { e.stopPropagation(); handlePageChange(pageNumber + 1); }}
              disabled={numPages ? pageNumber >= numPages : true}
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
