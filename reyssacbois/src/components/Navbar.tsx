"use client"

import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-green-700">
          ReyssacBois
        </Link>

        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <ul className="hidden md:flex gap-6 font-medium">
          <li><Link href="/">Accueil</Link></li>
          <li><Link href="/produits">Produits</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </div>

      {open && (
        <ul className="md:hidden px-4 pb-4 space-y-2 font-medium">
          <li><Link href="/">Accueil</Link></li>
          <li><Link href="/produits">Produits</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      )}
    </nav>
  )
}
