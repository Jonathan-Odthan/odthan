"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "./Button";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  links: NavLink[];
  accountUrl?: string;
}

export function Header({ links, accountUrl = "/connexion" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#D4AF37]/15 bg-[#050505]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo size="sm" />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#A0A0A0] transition-colors hover:text-[#F1D77A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href={accountUrl}>
            <Button variant="secondary">Connexion</Button>
          </Link>
        </div>

        <button
          aria-label="Ouvrir le menu"
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-[#D4AF37]/15 bg-[#0D0D0D] px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-sm font-medium text-[#A0A0A0] hover:text-[#F1D77A]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href={accountUrl} className="py-3">
            <Button variant="secondary" className="w-full">
              Connexion
            </Button>
          </Link>
        </nav>
      )}
    </header>
  );
}
