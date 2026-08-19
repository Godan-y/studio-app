"use client"

import * as React from "react"
import { Home, BookOpen, Library, User, BookMarked, LogOut, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth, useUser } from "@/firebase"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Accueil", icon: Home, href: "/" },
  { label: "Catégories", icon: BookOpen, href: "/categories" },
  { label: "Mes Livres", icon: Library, href: "/mes-livres" },
  { label: "Profil", icon: User, href: "/profil" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const auth = useAuth()
  const { user } = useUser()

  const handleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Mayele !",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: error.message,
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      })
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <Sidebar collapsible="icon" className="hidden md:flex border-r border-border/40 bg-background">
      <SidebarHeader className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-[#0b3d91] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <BookMarked className="w-7 h-7" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-xl tracking-tight text-[#0b3d91] dark:text-white">Mayele</span>
            <span className="text-[10px] font-bold text-[#c7a54b] tracking-[0.2em] uppercase">RD Congo</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-6 py-4">
        <SidebarMenu className="gap-3">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className="h-14 px-5 rounded-2xl data-[active=true]:bg-[#0b3d91] data-[active=true]:text-white data-[active=true]:shadow-xl hover:bg-[#0b3d91]/5 transition-all text-slate-600 dark:text-slate-300 font-bold"
              >
                <Link href={item.href}>
                  <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-[#0b3d91]'}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 space-y-4">
        {user ? (
          <div className="p-4 rounded-2xl bg-secondary/50 flex items-center gap-3 group-data-[collapsible=icon]:hidden">
            <div className="w-8 h-8 rounded-full bg-[#0b3d91] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{user.displayName || "Utilisateur"}</span>
              <span className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#0b3d91] via-[#0b3d91] to-[#3a6abf] text-white space-y-4 group-data-[collapsible=icon]:hidden shadow-xl animate-fade-in">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Espace Membre</p>
              <p className="text-xs font-bold leading-tight">Accédez à l'intégralité de la bibliothèque</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleAuth} size="sm" className="w-full bg-white text-[#0b3d91] hover:bg-white/90 rounded-xl font-bold gap-2 h-10">
                <LogIn className="w-4 h-4" />
                Se connecter
              </Button>
              <Button 
                onClick={handleAuth} 
                size="sm" 
                variant="ghost" 
                className="w-full border border-white/30 text-white hover:bg-white/10 rounded-xl font-bold gap-2 h-10"
              >
                <UserPlus className="w-4 h-4" />
                S'inscrire
              </Button>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton 
                onClick={handleLogout}
                className="h-12 px-5 rounded-2xl text-slate-400 hover:bg-destructive/5 hover:text-destructive transition-colors group-data-[collapsible=icon]:justify-center font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span className="group-data-[collapsible=icon]:hidden">Déconnexion</span>
              </SidebarMenuButton>
            ) : (
              <div className="md:hidden">
                <SidebarMenuButton 
                  onClick={handleAuth}
                  className="h-12 px-5 rounded-2xl text-[#0b3d91] hover:bg-[#0b3d91]/5 transition-colors group-data-[collapsible=icon]:justify-center font-bold"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Se connecter</span>
                </SidebarMenuButton>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
