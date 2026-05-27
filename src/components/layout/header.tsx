
"use client"

import { BookMarked, Bell, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-background sticky top-0 z-40 md:hidden">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
          <BookMarked className="w-6 h-6" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-headline font-bold text-lg tracking-tight text-primary">GM Biblio</span>
          <span className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase">RD Congo</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-slate-600 transition-colors"
          aria-label="Changer le thème"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-slate-600">
           <Bell className="w-5 h-5" />
        </button>
        <Link href="/profil" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 cursor-pointer transition-colors overflow-hidden border-2 border-border">
          <img src="https://picsum.photos/seed/user123/100/100" alt="Profile" className="w-full h-full object-cover" />
        </Link>
      </div>
    </header>
  )
}
