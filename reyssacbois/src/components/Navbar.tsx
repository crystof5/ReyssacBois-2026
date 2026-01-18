"use client"

import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/android-chrome-192x192.png"
              alt="Reyssac Bois"
              className="h-12 w-12 rounded-full bg-white"
            />
          </Link>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            Menu
          </button>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-900">
            <li>
              <Link href="/" className="hover:text-green-800">Accueil</Link>
            </li>
            <li>
              <Link href="/qui-sommes-nous" className="hover:text-green-800">
                Qui sommes-nous ?
              </Link>
            </li>
            <li>
              <Link href="/produits" className="hover:text-green-800">Produits</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-green-800">Contact</Link>
            </li>
          </ul>
        </div>

        {open && (
          <div id="mobile-menu" className="md:hidden pb-4">
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/" className="block rounded-lg px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/qui-sommes-nous" className="block rounded-lg px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Qui sommes-nous ?
                </Link>
              </li>
              <li>
                <Link href="/produits" className="block rounded-lg px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block rounded-lg px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
