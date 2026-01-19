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
  const [active, setActive] = useState(0)

  // Détermine l’item le plus proche du centre (pour agrandir celui du milieu)
  useEffect(() => {
    const el = ref.current
    if (!el) return

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
      setActive(bestIdx)
    }

    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // Auto-scroll “fluide” (scrollTo smooth)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (items.length <= 1) return

    const id = window.setInterval(() => {
      const next = (active + 1) % items.length
      const child = el.children[next] as HTMLElement | undefined
      if (!child) return

      child.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [active, intervalMs, items.length])

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="aspect-[16/10] w-full">
          <Media src={null} alt="Projet" className="h-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {items.map((s, idx) => (
          <div
            key={`${s.src}-${idx}`}
            className={`snap-center shrink-0 transition-transform duration-500 ${
              idx === active ? "scale-[1.05]" : "scale-[0.94] opacity-80"
            }`}
          >
            <div className="w-[80vw] sm:w-[70vw] md:w-[55vw] lg:w-[32vw] max-w-[520px]">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-white"
            onClick={() => {
              const el = ref.current
              if (!el) return
              const prev = (active - 1 + items.length) % items.length
              ;(el.children[prev] as HTMLElement | undefined)?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              })
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Projet suivant"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-white"
            onClick={() => {
              const el = ref.current
              if (!el) return
              const next = (active + 1) % items.length
              ;(el.children[next] as HTMLElement | undefined)?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              })
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}


