
"use client"

import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ArrowLeft, MessageCircle, Mail, MapPin, GraduationCap, Github, Linkedin, Twitter, Sparkles, Code2, Cpu } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function SupportPage() {
  const godePhoto = "/images/gode.jpg";

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="px-6 py-8 flex items-center gap-4 border-b border-border/50 max-w-2xl mx-auto w-full">
        <Link href="/profil">
          <ArrowLeft className="w-6 h-6 text-[#0b3d91]" />
        </Link>
        <h1 className="font-headline font-bold text-xl text-[#0b3d91]">Aide & Support</h1>
      </div>

      <div className="px-6 py-10 space-y-12 max-w-2xl mx-auto w-full animate-fade-in pb-32">
        <section className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full scale-125 blur-2xl animate-pulse" />
              <div className="relative p-1 bg-gradient-to-tr from-[#0b3d91] to-[#c7a54b] rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="w-40 h-40 rounded-[2.2rem] border-4 border-white dark:border-background relative overflow-hidden bg-muted">
                  <Image 
                    src={godePhoto} 
                    alt="Gode Mukeng Mukanz" 
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://picsum.photos/seed/gode/400/400";
                    }}
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#c7a54b] text-white p-2 rounded-2xl shadow-lg border-2 border-white dark:border-background">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-3xl text-[#0b3d91] dark:text-white">Gode Mukeng Mukanz</h2>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#0b3d91]/10 text-[#0b3d91] dark:bg-white/10 dark:text-white text-[10px] font-bold uppercase tracking-wider">Full-Stack</span>
                <span className="px-3 py-1 rounded-full bg-[#0b3d91]/10 text-[#0b3d91] dark:bg-white/10 dark:text-white text-[10px] font-bold uppercase tracking-wider">Mobile</span>
                <span className="px-3 py-1 rounded-full bg-[#c7a54b]/10 text-[#c7a54b] text-[10px] font-bold uppercase tracking-wider">IA & Automation</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="p-8 rounded-[2.5rem] bg-[#0b3d91] text-white space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors" />
              
              <div className="flex items-center gap-3 text-accent mb-2">
                <Code2 className="w-6 h-6" />
                <span className="font-bold text-xs uppercase tracking-[0.2em]">Expertise Technique</span>
              </div>
              
              <p className="text-base font-medium leading-relaxed opacity-95 relative z-10">
                Je conçois des applications modernes comme Mayele, des systèmes intelligents et des automatisations avancées qui transforment les idées en produits digitaux performants.
              </p>
              
              <div className="flex items-center gap-3 text-accent mt-4">
                <Cpu className="w-6 h-6" />
                <span className="font-bold text-xs uppercase tracking-[0.2em]">Impact Business</span>
              </div>
              
              <p className="text-sm leading-relaxed relative z-10 opacity-90 italic">
                "J'aide les entrepreneurs et entreprises à automatiser leurs processus, lancer leurs produits plus rapidement et exploiter la puissance de l'IA."
              </p>
              
              <div className="pt-6 border-t border-white/10 flex items-center gap-3 text-xs font-bold">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <span>Étudiant à l'Université Pédagogique Nationale (UPN)</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-headline font-bold text-xl text-[#0b3d91] flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Me Contacter
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="https://wa.me/243973199473" target="_blank" className="w-full">
              <Button className="w-full h-20 rounded-3xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold gap-3 text-lg shadow-lg transition-all hover:scale-[1.02]">
                <MessageCircle className="w-6 h-6" />
                WhatsApp
              </Button>
            </Link>

            <Link href="mailto:mukanzgode@gmail.com" className="w-full">
              <Button variant="outline" className="w-full h-20 rounded-3xl border-2 border-[#0b3d91] text-[#0b3d91] font-bold gap-3 text-lg hover:bg-[#0b3d91]/5 transition-all hover:scale-[1.02]">
                <Mail className="w-6 h-6" />
                Email
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-headline font-bold text-xl text-[#0b3d91]">Localisation</h3>
          <div className="flex items-center gap-5 p-8 rounded-[2.5rem] bg-secondary/30 border border-border/50">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <MapPin className="w-7 h-7 text-[#0b3d91]" />
            </div>
            <div>
              <p className="font-bold text-lg">Kinshasa, RD Congo</p>
              <p className="text-sm text-muted-foreground">Disponible pour projets locaux et internationaux.</p>
            </div>
          </div>
        </section>

        <div className="pt-12 text-center space-y-6">
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">
            MAYELE - Propulsé par Gode Mukeng Automation
          </p>
          <div className="flex justify-center gap-8">
            <Link href="#" className="text-slate-300 hover:text-[#0b3d91] transition-all hover:scale-110"><Github className="w-6 h-6" /></Link>
            <Link href="#" className="text-slate-300 hover:text-[#0b3d91] transition-all hover:scale-110"><Linkedin className="w-6 h-6" /></Link>
            <Link href="#" className="text-slate-300 hover:text-[#0b3d91] transition-all hover:scale-110"><Twitter className="w-6 h-6" /></Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
