"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

function scrollToHash(offsetPx: number) {
  const raw = window.location.hash || ""
  const id = raw.replace(/^#/, "")
  if (!id) return

  const el = document.getElementById(decodeURIComponent(id))
  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - offsetPx
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" })
}

/**
 * Assure un scroll fiable vers les ancres (#contact, #qui-sommes-nous, ...),
 * y compris après navigation Next.js (App Router).
 */
export default function HashScroll({ offsetPx = 96 }: { offsetPx?: number }) {
  const pathname = usePathname()

  useEffect(() => {
    // Sur un chargement direct (ou après navigation), l'élément peut arriver après l'hydratation.
    const t = window.setTimeout(() => scrollToHash(offsetPx), 0)
    return () => window.clearTimeout(t)
  }, [pathname, offsetPx])

  useEffect(() => {
    const onHashChange = () => scrollToHash(offsetPx)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [offsetPx])

  return null
}

