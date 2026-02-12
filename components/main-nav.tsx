'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
  href: string;
  label: string;
};

type MainNavProps = {
  items: NavItem[];
};

export default function MainNav({ items }: MainNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú principal"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="ml-auto inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 p-2 text-deck-100 transition hover:bg-white/10 sm:hidden"
      >
        <span className="sr-only">Menú</span>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <ul className="hidden items-center gap-2 text-sm sm:flex">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-white ${pathname === item.href ? 'text-white' : 'text-deck-300'}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {isOpen && (
        <ul className="grid w-full grid-cols-1 gap-2 text-sm sm:hidden">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 text-center transition hover:bg-white/10 hover:text-white ${pathname === item.href ? 'text-white' : 'text-deck-300'}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
