"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Media from "@/components/ui/Media"

export type ProjectsSlide = {
  src: string
  alt: string
}

export default function ProjectsCarousel({
  slides,
  intervalMs = 5000,
}: {
  slides: ProjectsSlide[]
  intervalMs?: number
}) {
  const items = useMemo(() => slides.filter((s) => s.src), [slides])
  const ref = useRef<HTMLDivElement | null>(null)
  const [activePhysical, setActivePhysical] = useState(0)
  const [paused, setPaused] = useState(false)
  const activeLogical = items.length ? activePhysical % items.length : 0

  // On duplique 3 fois pour simuler une boucle infinie “invisible”.
  const loopItems = useMemo(() => {
    if (items.length <= 1) return items
    return [...items, ...items, ...items]
  }, [items])

  function centerPhysicalIndex(idx: number): number {
    if (items.length <= 1) return 0
    return (idx % items.length) + items.length
  }

  function scrollToIndex(idx: number, behavior: ScrollBehavior = "smooth") {
    const el = ref.current
    if (!el) return
    const child = el.children[idx] as HTMLElement | undefined
    if (!child) return

    // Scroll horizontal uniquement (ne doit pas déplacer la page verticalement)
    const target =
      child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2
    el.scrollTo({ left: Math.max(0, target), behavior })
  }

  // Détermine l’item le plus proche du centre (pour agrandir celui du milieu)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (loopItems.length === 0) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2

      const children = Array.from(el.children) as HTMLElement[]
      let bestIdx = 0
      let bestDist = Number.POSITIVE_INFINITY
      children.forEach((child, idx) => {
        const r = child.getBoundingClientRect()
        const childCenter = r.left + r.width / 2
        const dist = Math.abs(childCenter - centerX)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = idx
        }
      })
      setActivePhysical(bestIdx)

      // Recentre “sans flash” dans le bloc du milieu pour garder une boucle infinie.
      if (items.length > 1) {
        const middleStart = items.length
        const middleEnd = items.length * 2 - 1
        if (bestIdx < middleStart || bestIdx > middleEnd) {
          const centered = centerPhysicalIndex(bestIdx)
          // même slide (dupliquée) => pas visible, mais évite d'atteindre une “fin”.
          scrollToIndex(centered, "auto")
          setActivePhysical(centered)
        }
      }
    }

    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [items.length, loopItems.length])

  // Auto-scroll “fluide” (scrollTo smooth)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (items.length <= 1) return
    if (paused) return

    const id = window.setInterval(() => {
      const next = activePhysical + 1
      scrollToIndex(next, "smooth")
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [activePhysical, intervalMs, items.length, paused])

  // Au montage / quand les slides changent: se positionner au centre (bloc du milieu).
  useEffect(() => {
    if (items.length <= 1) return
    const centered = items.length // première slide du bloc du milieu
    // Scroll “instant” pour éviter un grand mouvement au chargement.
    const t = window.setTimeout(() => {
      scrollToIndex(centered, "auto")
      setActivePhysical(centered)
    }, 0)
    return () => window.clearTimeout(t)
  }, [items.length])

  if (items.length === 0) {
    return (
      <div className="rb-card overflow-hidden">
        <div className="aspect-[16/10] w-full">
          <Media src={null} alt="Projet" className="h-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={ref}
          className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        >
          {loopItems.map((s, idx) => (
            <div
              key={`${s.src}-${idx}`}
              className={`snap-center shrink-0 transition-all duration-500 ${
                (items.length > 1 ? idx % items.length : idx) === activeLogical
                  ? "scale-100 opacity-100"
                  : "scale-[0.96] opacity-70"
              }`}
            >
              <div className="w-[80vw] sm:w-[70vw] md:w-[55vw] lg:w-[32vw] max-w-[520px]">
                <div className="rb-card overflow-hidden">
                  <div className="aspect-[16/10] w-full">
                    <Media src={s.src} alt={s.alt} className="h-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* flèches (desktop) */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Projet précédent"
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-line bg-surface text-ink shadow-sm transition-colors hover:border-forest-700 hover:text-forest-700 md:flex"
              onClick={() => scrollToIndex(activePhysical - 1, "smooth")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Projet suivant"
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-line bg-surface text-ink shadow-sm transition-colors hover:border-forest-700 hover:text-forest-700 md:flex"
              onClick={() => scrollToIndex(activePhysical + 1, "smooth")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* indicateurs (points) */}
      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              aria-label={`Aller au projet ${i + 1}`}
              aria-current={i === activeLogical}
              onClick={() => {
                const target = centerPhysicalIndex(i)
                scrollToIndex(target, "smooth")
                setActivePhysical(target)
              }}
              className={`h-1.5 rounded-sm transition-all ${
                i === activeLogical
                  ? "w-6 bg-forest-700"
                  : "w-2.5 bg-line-strong hover:bg-ink-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}


