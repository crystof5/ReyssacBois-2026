"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import SearchBar from "@/components/SearchBar"
import SocialLinksClient from "./SocialLinksClient"

export default function NavbarClient({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [navK, setNavK] = useState(0) // 0..1 (transition douce au scroll)
  const rafRef = useRef<number | null>(null)

  // Fermer au clavier (Escape) quand l’overlay de recherche est ouvert
  useEffect(() => {
    if (!searchOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [searchOpen])

  useEffect(() => {
    const compute = () => {
      // 0 => haut de page, 1 => navbar “pleine” (évite le switch brutal)
      const y = window.scrollY || 0
      const k = Math.max(0, Math.min(1, y / 160))
      setNavK(k)
    }

    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        compute()
      })
    }

    compute()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Mobile UX: fermer automatiquement le menu si l'utilisateur scroll / swipe.
  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)
    window.addEventListener("scroll", close, { passive: true })
    window.addEventListener("touchmove", close, { passive: true })

    return () => {
      window.removeEventListener("scroll", close)
      window.removeEventListener("touchmove", close)
    }
  }, [open])

  return (
    <nav
      className="sticky top-0 z-40 text-white backdrop-blur"
      style={{
        // Même style partout, mais opacité progressive au scroll (aucun “coup”).
        backgroundImage: `linear-gradient(to bottom,
          rgba(0,0,0,${0.72 + 0.18 * navK}),
          rgba(0,0,0,${0.45 + 0.25 * navK}),
          rgba(0,0,0,${0.0 + 0.70 * navK})
        )`,
        boxShadow:
          navK > 0
            ? `0 12px 40px -30px rgba(0,0,0,${0.85 * navK})`
            : "none",
        transition: "background-image 220ms ease, box-shadow 220ms ease",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4">
          <Link href="/#accueil" className="flex items-center" aria-label="Revenir en haut de page">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/android-chrome-192x192.png"
              alt="Reyssac Bois"
              className="h-12 w-12 rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-105"
            />
          </Link>

          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar mode="public" placeholder="Rechercher dans le catalogue…" showHint={false} />
          </div>

          {/* Mobile: actions à droite (recherche + burger) */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 backdrop-blur"
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
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 backdrop-blur"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <span className="text-xl leading-none">☰</span>
            </button>
          </div>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
            <li>
              <Link href="/#accueil" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/qui-sommes-nous" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                Qui sommes-nous ?
              </Link>
            </li>
            <li className="hidden lg:list-item">
              <Link href="/livraison-bois" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                Livraison
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="inline-block transition-transform duration-200 hover:scale-105 hover:text-white/90">
                Contact
              </Link>
            </li>
            <li className="ml-2">
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide hover:bg-white/15"
              >
                Catalogue
                <span aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="ml-1">
              <SocialLinksClient variant="dark" />
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
              className="md:hidden fixed inset-0 z-30 bg-black/55"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            />

            <div
              id="mobile-menu"
              className="md:hidden absolute left-0 right-0 top-full z-40 px-4 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl border border-white/25 bg-black/70 backdrop-blur-xl p-2 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
                <ul className="space-y-1 text-sm font-medium text-white">
                  <li>
                    <Link href="/#accueil" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link href="/qui-sommes-nous" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Qui sommes-nous ?
                    </Link>
                  </li>
                  <li>
                    <Link href="/livraison-bois" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Livraison
                    </Link>
                  </li>
                  <li>
                    <Link href="/decoupe-panneaux-sur-mesure" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Découpe sur mesure
                    </Link>
                  </li>
                  <li>
                    <Link href="/conseils" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Conseils
                    </Link>
                  </li>
                  <li>
                    <Link href="/#faq" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/produits" className="block rounded-lg px-3 py-2 hover:bg-white/15" onClick={() => setOpen(false)}>
                      Catalogue
                    </Link>
                  </li>
                  <li className="px-3 pt-1">
                    <SocialLinksClient variant="dark" />
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
              <div className="rounded-2xl border border-white/20 bg-black/35 backdrop-blur p-3 shadow-xl">
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
                  <SearchBar
                    mode="public"
                    placeholder="Rechercher dans le catalogue…"
                    showHint={false}
                    onSelectResult={() => setSearchOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

