"use client"

import { usePathname } from "next/navigation"
import { useEffect, useMemo } from "react"

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

  useEffect(() => {
    if (pathname !== "/") return
    if (!("IntersectionObserver" in window)) return

    const elements = ids
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((x): x is { id: string; el: HTMLElement } => Boolean(x.el))

    if (!elements.length) return

    let current: string | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        // On prend la section la plus “dominante” parmi celles visibles
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))

        const top = visible[0]
        const id = top?.target?.id
        if (!id) return

        if (current !== id) {
          current = id
          setHashSilently(id)
        }
      },
      {
        // On considère qu'une section “active” commence un peu sous la navbar
        root: null,
        rootMargin: `-${offsetPx}px 0px -65% 0px`,
        threshold: [0, 0.05, 0.15, 0.3, 0.5],
      },
    )

    for (const { el } of elements) observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [pathname, idsKey, offsetPx, ids])

  return null
}

