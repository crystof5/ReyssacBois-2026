"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import SearchBar from "@/components/SearchBar"

export default function NavbarClient({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Fermer au clavier (Escape) quand l’overlay de recherche est ouvert
  useEffect(() => {
    if (!searchOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [searchOpen])

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-br from-gradient-start to-gradient-end border-b border-black/10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/android-chrome-192x192.png"
              alt="Reyssac Bois"
              className="h-12 w-12 rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-105"
            />
          </Link>

          <div className="hidden md:block flex-1 max-w-xl">
            <SearchBar mode="public" />
          </div>

          {/* Mobile: bouton recherche (hors menu) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 backdrop-blur"
            onClick={() => {
              setSearchOpen(true)
              setOpen(false)
            }}
            aria-label="Rechercher"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.3 16.3 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 backdrop-blur"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span className="text-xl leading-none">☰</span>
          </button>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
            <li>
              <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">Accueil</Link>
            </li>
            <li>
              <Link href="/qui-sommes-nous" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                Qui sommes-nous ?
              </Link>
            </li>
            <li>
              <Link href="/produits" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">Produits</Link>
            </li>
            <li>
              <Link href="/contact" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">Contact</Link>
            </li>
            {isAuthed && (
              <li>
                <Link href="/admin" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                  Administration
                </Link>
              </li>
            )}
          </ul>
        </div>

        {open && (
          <>
            {/* overlay click => close */}
            <button
              type="button"
              className="md:hidden fixed inset-0 z-30 bg-black/30"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            />

            <div
              id="mobile-menu"
              className="md:hidden absolute left-0 right-0 top-full z-40 px-4 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-2">
                <ul className="space-y-1 text-sm font-medium text-white">
                  <li>
                    <Link href="/" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link href="/qui-sommes-nous" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Qui sommes-nous ?
                    </Link>
                  </li>
                  <li>
                    <Link href="/produits" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Produits
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Contact
                    </Link>
                  </li>
                  {isAuthed && (
                    <li>
                      <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                        Administration
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Mobile overlay recherche */}
        {searchOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Fermer la recherche"
              onClick={() => setSearchOpen(false)}
            />
            <div className="absolute left-0 right-0 top-0 px-4 pt-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-3 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">Rechercher</p>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
                  >
                    Fermer
                  </button>
                </div>
                <div className="mt-3">
                  <SearchBar mode="public" onSelectResult={() => setSearchOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

