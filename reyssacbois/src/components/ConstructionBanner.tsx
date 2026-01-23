"use client"

import { useEffect, useMemo, useState } from "react"
import RichText from "@/components/ui/RichText"

export default function ConstructionBanner({
  text,
  textHtml,
}: {
  text: string
  textHtml?: string
}) {
  const t = text.trim()
  const html = (textHtml ?? "").trim()
  const storageKey = useMemo(
    () => `constructionBannerDismissed::${(html || t).slice(0, 160)}`,
    [html, t]
  )

  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!t) {
      setOpen(false)
      return
    }
    try {
      setOpen(!window.localStorage.getItem(storageKey))
    } catch {
      setOpen(true)
    }
  }, [storageKey, t])

  if ((!t && !html) || !open) return null

  return (
    <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-white/70 to-amber-50/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-900 ring-1 ring-amber-500/20">
              i
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-500/20">
                  Site en construction
                </span>
                {html ? (
                  <RichText html={html} className="text-sm text-gray-700" />
                ) : (
                  <p className="text-sm text-gray-700">{t}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
              onClick={() => {
                try {
                  window.localStorage.setItem(storageKey, "1")
                } catch {
                  // ignore
                }
                setOpen(false)
              }}
              aria-label="Fermer la bannière"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

