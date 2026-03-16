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
              <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                  <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="hidden font-bold sm:inline-block">
                      Mineração de Ofertas
                    </span>
                  </Link>
                  <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Dashboard
                    </Link>
                    <Link href="/ofertas" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Ofertas
                    </Link>
                    <Link href="/paginas" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Páginas
                    </Link>
                    <Link href="/tendencias" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Tendências
                    </Link>
                    <Link href="/alertas" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Alertas
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
