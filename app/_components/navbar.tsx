"use client";
import Logout from "./logout";
import Logo from "./logo";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  isAuthenticated: boolean;
}

export default function Navbar({ isAuthenticated }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative grid grid-cols-2 md:grid-cols-3 items-center py-4 px-2 md:px-6">
      {/* Logo */}
      <div>
        <Link
          href="/"
          className="flex items-center space-x-0.5 hover:opacity-80 transition-opacity"
        >
          <Logo className="w-10 h-10 md:w-12 md:h-12 text-blue-950 dark:text-white" />
          <h1 className="text-xl md:text-2xl font-bold">Utlegg</h1>
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-center gap-4 md:gap-6 whitespace-nowrap">
        {isAuthenticated && (
          <>
            <Link href="/utlegg" className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium">Send utlegg</Link>
            <Link href="/soknad-om-stotte" className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium">Søk støtte</Link>
            <Link href="/idrettslag-stotte" className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium">Støtte til idrettslag</Link>
            <Link href="/sak-til-hs" className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium">Send inn sak til HS</Link>
          </>
        )}
      </nav>

      {/* Right side: Logout and burger */}
      <div className="flex items-right justify-end space-x-2">
        {isAuthenticated && (
          <>
            {/* Burger icon only for mobile and only if logged in */}
            <div className="md:hidden">
              <button
                aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                type="button"
              >
                {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button> 
              </div>
            </>
              )}
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && isAuthenticated && (
        <nav className="absolute top-full left-0 w-full z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col md:hidden animate-in fade-in-0 slide-in-from-top-2">
          <Link href="/utlegg" className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 text-base font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>Send utlegg</Link>
          <Link href="/soknad-om-stotte" className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 text-base font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>Søk støtte</Link>
          <Link href="/idrettslag-stotte" className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 text-base font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>Støtte til idrettslag</Link>
          <Link href="/sak-til-hs" className="px-6 py-4 text-base font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>Send inn sak til HS</Link>
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <Logout />
          </div>
        </nav>
      )}
    </header>
  );
}
