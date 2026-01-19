"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Media from "@/components/ui/Media"

type PromoModalProps = {
  promo: {
    isVisible: boolean
    title: string
    text: string
    image?: { src: string; alt: string } | null
  } | null
}

export default function PromoModal({ promo }: PromoModalProps) {
  const [open, setOpen] = useState(false)

  const promoKey = useMemo(() => {
    if (!promo) return ""
    const src = promo.image?.src ?? ""
    // clé stable (mais courte) pour ré-afficher si le contenu change
    return `${promo.title}|${promo.text}|${src}`.slice(0, 160)
  }, [promo])

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(`promoDismissed::${promoKey}`, "1")
    } catch {
      // ignore
    }
  }, [promoKey])

  useEffect(() => {
    if (!promo?.isVisible) {
      setOpen(false)
      return
    }
    if (!promo.title.trim() && !promo.text.trim() && !(promo.image?.src?.trim() ?? "")) {
      setOpen(false)
      return
    }

    try {
      const dismissed = window.localStorage.getItem(`promoDismissed::${promoKey}`)
      setOpen(!dismissed)
    } catch {
      setOpen(true)
    }
  }, [promo, promoKey])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss()
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dismiss, open])

  if (!promo?.isVisible) return null
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fermer la promo"
        onClick={() => {
          dismiss()
          setOpen(false)
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Promo"
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {promo.title.trim() ? promo.title : "Information"}
            </p>
            <button
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => {
                dismiss()
                setOpen(false)
              }}
            >
              Fermer
            </button>
          </div>

          {promo.image?.src?.trim() ? (
            <div className="aspect-[16/9] w-full bg-gray-50">
              <Media
                src={promo.image.src}
                alt={promo.image.alt || promo.title || "Promo"}
                className="h-full w-full"
              />
            </div>
          ) : null}

          {promo.text.trim() ? (
            <div className="px-4 py-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {promo.text}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

