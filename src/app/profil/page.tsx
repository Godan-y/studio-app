"use client"

import { useMemo, useState } from "react"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ChevronRight, LogIn, UserPlus, LogOut, Loader2, BookMarked, Bell, HelpCircle, CreditCard, Clock, Star } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useUser, useAuth, useCollection, useFirestore } from "@/firebase"
import { signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { collection, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const { user, loading: userLoading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Récupérer le nombre de livres achetés
  const purchasesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "purchases"), where("userId", "==", user.uid), where("paid", "==", true));
  }, [db, user]);

  const { data: purchasesDocs, loading: purchasesLoading } = useCollection(purchasesQuery);

  const bookCount = useMemo(() => {
    if (!purchasesDocs) return 0;
    return new Set(purchasesDocs.map(doc => doc.data().bookId)).size;
  }, [purchasesDocs]);

  const handleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre profil !",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
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

  // Statistiques simulées
  const stats = [
    { 
      value: bookCount.toString(), 
      label: "LIVRES", 
      icon: BookMarked,
      color: "text-blue-600" 
    },
    { 
      value: "12h", 
      label: "TEMPS", 
      icon: Clock,
      color: "text-amber-500"
    },
    { 
      value: "4.9", 
      label: "SCORE", 
      icon: Star,
      color: "text-emerald-500"
    },
  ]

  if (userLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-background pb-20">
      <Header />
      
      <div className="px-6 py-10 max-w-2xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-headline font-bold text-4xl text-[#0b3d91] dark:text-white">Profil</h1>
          {user && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full bg-secondary/50">
              {theme === "dark" ? <Clock className="w-5 h-5 text-amber-500" /> : <Clock className="w-5 h-5" />}
            </Button>
          )}
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-[3rem] border border-slate-100 dark:border-border bg-slate-50/30 dark:bg-card/30 text-center space-y-8">
            <div className="w-20 h-20 bg-[#0b3d91] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/20">
              <BookMarked className="w-10 h-10" />
            </div>
            <div className="space-y-3 max-w-sm">
              <h2 className="font-headline font-bold text-2xl text-[#0b3d91] dark:text-white">Espace Personnel</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Connectez-vous pour voir vos statistiques et accéder à vos paramètres.</p>
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
        ) : (
          <>
            <div className="bg-white dark:bg-card border border-slate-100 dark:border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
              <Avatar className="w-20 h-20 rounded-2xl shadow-lg border-2 border-white dark:border-border">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || "Avatar"} className="object-cover" />
                <AvatarFallback className="bg-[#0b3d91] text-white text-2xl font-bold">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h2 className="font-headline font-bold text-xl text-[#0b3d91] dark:text-white truncate">
                  {user.displayName || "Lecteur Premium"}
                </h2>
                <p className="text-slate-400 text-sm truncate">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-card border border-slate-100 dark:border-border p-4 rounded-[1.5rem] shadow-sm text-center flex flex-col items-center justify-center space-y-1 group hover:border-primary/20 transition-colors">
                  <div className={`p-2 rounded-xl bg-secondary/30 mb-1`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="font-headline font-bold text-xl text-[#0b3d91] dark:text-white">
                    {stat.label === "LIVRES" && purchasesLoading ? "..." : stat.value}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-[2rem] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-border">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">Notifications</span>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                />
              </div>

              <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-border">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">Moyens de paiement</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <Link href="/support" className="w-full flex items-center justify-between p-6 border-b border-slate-50 dark:border-border transition-colors hover:bg-slate-50 dark:hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">Aide & Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-6 transition-colors hover:bg-destructive/5 text-destructive font-bold"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        <div className="pt-10 text-center">
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
            MAYELE - V1.0
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
