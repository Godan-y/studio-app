import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseClientProvider } from "@/firebase";

export const metadata: Metadata = {
  title: 'Mayele - Bibliothèque Numérique Premium',
  description: 'Votre accès privilégié au savoir et à la culture en RDC. Découvrez, gérez et lisez vos livres préférés en toute sécurité.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <FirebaseClientProvider>
          <ThemeProvider>
            <SidebarProvider defaultOpen={true}>
              <div className="flex min-h-screen w-full bg-background">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
                  <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col pb-20 md:pb-0">
                    {children}
                  </div>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
