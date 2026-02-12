import type { Metadata } from 'next';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Patineto',
  description: 'Mini-apps para skaters: S.K.A.T.E, dados y más.',
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/skate', label: 'S.K.A.T.E' },
  { href: '/dice', label: 'Dados' },
  { href: '/profile', label: 'Perfil' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <header className="sticky top-0 z-20 border-b border-white/10 bg-deck-950/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-black tracking-tight text-white">
              Patineto
            </Link>
            <ul className="flex items-center gap-2 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-md px-3 py-2 text-deck-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-6xl px-6 py-10">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
