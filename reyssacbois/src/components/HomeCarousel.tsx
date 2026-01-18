"use client"

import { useEffect, useMemo, useState } from "react"
import Media from "@/components/ui/Media"

export type HomeSlide = {
  src: string
  alt: string
}

export default function HomeCarousel({
  slides,
  intervalMs = 5000,
  className = "",
}: {
  slides: HomeSlide[]
  intervalMs?: number
  className?: string
}) {
  const safeSlides = useMemo(() => slides.filter((s) => s.src), [slides])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (safeSlides.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeSlides.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, safeSlides.length])

  if (safeSlides.length === 0) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Media src={null} alt="Illustration" className="h-full w-full" />
      </div>
    )
  }

  const current = safeSlides[index]!

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <Media src={current.src} alt={current.alt} className="h-full w-full" />
      </div>

      {/* Overlay sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Controls */}
      {safeSlides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white backdrop-blur hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
            onClick={() => setIndex((i) => (i - 1 + safeSlides.length) % safeSlides.length)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white backdrop-blur hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
            onClick={() => setIndex((i) => (i + 1) % safeSlides.length)}
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {safeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Aller à la photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}


