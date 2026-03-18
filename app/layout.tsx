import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { ConvexClientProvider } from './ConvexClientProvider';

export const metadata: Metadata = {
  title: 'Mineração de Ofertas',
  description: 'Sistema de mineração de ofertas escaladas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ConvexClientProvider>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <Link href="/buscador" className="font-bold">
                  Mining-Sale
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium">
                  <Link href="/buscador" className="transition-colors hover:text-foreground text-foreground/80">
                    Buscador
                  </Link>
                  <Link href="/ofertas" className="transition-colors hover:text-foreground text-foreground/80">
                    Minhas Ofertas
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
