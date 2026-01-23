"use client"

import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef } from "react"

function setHashSilently(id: string) {
  const next = `#${encodeURIComponent(id)}`
  const url = `${window.location.pathname}${window.location.search}${next}`
  if (window.location.hash === next) return
  window.history.replaceState(null, "", url)
}

/**
 * Met à jour l'URL (#...) au scroll, sans déclencher de "jump" (pas de hashchange).
 * Objectif: avoir une URL descriptive par section (SEO/partage).
 */
export default function HashSections({
  ids,
  offsetPx = 96,
}: {
  ids: string[]
  offsetPx?: number
}) {
  const pathname = usePathname()
  const idsKey = useMemo(() => ids.join("|"), [ids])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (pathname !== "/") return

    const elements = ids
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((x): x is { id: string; el: HTMLElement } => Boolean(x.el))

    if (!elements.length) return

    let current: string | null = null

    const computeActiveId = () => {
      // Règle "scrollspy" la plus fiable:
      // section active = la DERNIÈRE section dont le top est passé sous la navbar.
      const markerY = offsetPx + 2
      let active = elements[0]?.id ?? null
      for (const { id, el } of elements) {
        const top = el.getBoundingClientRect().top
        if (top <= markerY) active = id
        else break
      }
      return active
    }

    const tick = () => {
      rafRef.current = null
      const id = computeActiveId()
      if (!id) return
      if (current !== id) {
        current = id
        setHashSilently(id)
      }
    }

    const onScrollOrResize = () => {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(tick)
    }

    // Initial
    onScrollOrResize()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)

    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [pathname, idsKey, offsetPx, ids])

  return null
}

