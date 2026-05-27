
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Library, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Accueil", icon: Home, href: "/" },
  { label: "Catégories", icon: BookOpen, href: "/categories" },
  { label: "Mes Livres", icon: Library, href: "/mes-livres" },
  { label: "Profil", icon: User, href: "/profil" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden h-16 bg-background/80 backdrop-blur-lg border-t border-border flex items-center justify-around px-6 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 group",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-all duration-300",
              isActive ? "bg-primary/10" : "group-hover:bg-primary/5"
            )}>
              <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
            </div>
            <span className={cn("text-[10px] font-medium transition-opacity", isActive ? "opacity-100" : "opacity-80")}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
