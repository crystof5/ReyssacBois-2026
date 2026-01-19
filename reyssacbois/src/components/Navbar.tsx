"use client"

import { useState } from "react"
import Link from "next/link"
import { useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-br from-gradient-start to-gradient-end border-b border-black/10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/android-chrome-192x192.png"
              alt="Reyssac Bois"
              className="h-12 w-12 rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-105"
            />
          </Link>

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
          <div id="mobile-menu" className="md:hidden pb-4">
            <ul className="space-y-2 text-sm font-medium text-white">
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
        )}
      </div>
    </nav>
  )
}
