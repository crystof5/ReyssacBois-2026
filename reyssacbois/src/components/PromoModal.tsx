"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Media from "@/components/ui/Media"

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function sanitizeHref(raw: string) {
  const href = raw.trim()
  if (!href) return ""
  // Autoriser liens internes, mailto/tel, http(s).
  if (href.startsWith("/")) return href
  if (href.startsWith("mailto:")) return href
  if (href.startsWith("tel:")) return href
  if (/^https?:\/\//i.test(href)) return href
  return ""
}

function formatPromoTextToSafeHtml(text: string) {
  // Mini-markdown safe: **gras**, *italique*, [texte](url), retours ligne.
  // 1) escape HTML
  let s = escapeHtml(text)

  // 2) liens [label](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safeHref = sanitizeHref(String(url))
    const safeLabel = String(label)
    if (!safeHref) return safeLabel
    return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-800">${safeLabel}</a>`
  })

  // 3) gras **...**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  // 4) italique *...* (simple, sans gérer tous les cas de nesting)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")

  // 5) paragraphes
  const paragraphs = s
    .split(/\n{2,}/g)
    .map((p) => p.replace(/\n/g, "<br/>").trim())
    .filter(Boolean)

  return paragraphs.map((p) => `<p>${p}</p>`).join("")
}

type PromoModalProps = {
  promo: {
    isVisible: boolean
    title: string
    text: string
    textHtml?: string
    image?: { src: string; alt: string } | null
  } | null
  mode?: "public" | "adminPreview"
  onRequestClose?: () => void
}

export default function PromoModal({ promo, mode = "public", onRequestClose }: PromoModalProps) {
  const [open, setOpen] = useState(false)
  const isPreview = mode === "adminPreview"
  const [entered, setEntered] = useState(false)
  const richHtml = useMemo(() => {
    const html = typeof promo?.textHtml === "string" ? promo.textHtml.trim() : ""
    if (html) return html
    return promo?.text?.trim() ? formatPromoTextToSafeHtml(promo.text) : ""
  }, [promo])
  const firstHref = useMemo(() => {
    const m = richHtml.match(/<a[^>]+href="([^"]+)"/i)
    return m?.[1] ?? ""
  }, [richHtml])
  const isInternalCta = firstHref.startsWith("/")

  const promoKey = useMemo(() => {
    if (!promo) return ""
    const src = promo.image?.src ?? ""
    // clé stable (mais courte) pour ré-afficher si le contenu change
    return `${promo.title}|${promo.text}|${src}`.slice(0, 160)
  }, [promo])

  const dismiss = useCallback(() => {
    if (isPreview) return
    try {
      window.localStorage.setItem(`promoDismissed::${promoKey}`, "1")
    } catch {
      // ignore
    }
  }, [isPreview, promoKey])

  useEffect(() => {
    if (!promo) {
      setOpen(false)
      setEntered(false)
      return
    }
    if (!promo.title.trim() && !promo.text.trim() && !(promo.image?.src?.trim() ?? "")) {
      setOpen(false)
      setEntered(false)
      return
    }

    if (isPreview) {
      setOpen(true)
      setEntered(false)
      return
    }

    if (!promo.isVisible) {
      setOpen(false)
      setEntered(false)
      return
    }

    try {
      const dismissed = window.localStorage.getItem(`promoDismissed::${promoKey}`)
      setOpen(!dismissed)
      setEntered(false)
    } catch {
      setOpen(true)
      setEntered(false)
    }
  }, [isPreview, promo, promoKey])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setEntered(true), 10)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss()
        setOpen(false)
        onRequestClose?.()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dismiss, onRequestClose, open])

  if (!promo) return null
  if (!promo.isVisible && !isPreview) return null
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Fermer la promo"
        onClick={() => {
          dismiss()
          setOpen(false)
          onRequestClose?.()
        }}
      />

      {/* Important: le conteneur prend tout l'écran ; on le rend "transparent" aux clics
          pour que le clic sur le flou/backdrop ferme bien la modale. */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        {/* gradient border */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Promo"
          className={[
            "relative w-full max-w-2xl pointer-events-auto",
            "overflow-hidden rounded-lg border border-line bg-surface",
            "shadow-[var(--shadow-pop)]",
            "transition duration-200 ease-out will-change-transform",
            entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          {/* accent haut */}
          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-forest-700" />

          {/* sticker */}
          <div className="absolute left-5 top-5 z-20">
            <div className="inline-flex items-center gap-2 rounded-sm bg-forest-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Nouveau
            </div>
          </div>

          {/* close */}
          <div className="absolute right-4 top-4 z-20">
            <button
              type="button"
              aria-label="Fermer"
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-line bg-surface text-ink shadow-sm transition-colors hover:border-forest-700 hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
              onClick={() => {
                dismiss()
                setOpen(false)
                onRequestClose?.()
              }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* hero */}
          <div className="relative">
            {promo.image?.src?.trim() ? (
              <div className="h-56 sm:h-64 w-full overflow-hidden border-b border-line">
                <Media
                  src={promo.image.src}
                  alt={promo.image.alt || promo.title || "Promo"}
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="rb-grid-bg h-40 sm:h-48 w-full border-b border-line bg-surface-2" />
            )}
          </div>

          {/* content */}
          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
            {isPreview ? (
              <span className="rb-badge rb-badge-timber">
                Aperçu admin (non visible publiquement)
              </span>
            ) : null}

            <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-ink">
              {promo.title.trim() ? promo.title : "Information"}
            </h3>

            {promo.image?.alt?.trim() ? (
              <p className="mt-1 text-xs text-ink-400">{promo.image.alt}</p>
            ) : null}

            <div className="mt-4 max-h-[45vh] overflow-y-auto pr-1">
              {richHtml.trim() ? (
                <div
                  className={[
                    "text-[15px] leading-relaxed text-ink-600",
                    "space-y-3",
                    "[&_p]:m-0",
                    "[&_strong]:font-extrabold [&_strong]:text-ink",
                    "[&_em]:italic",
                    "[&_a]:font-extrabold [&_a]:text-forest-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-forest-800",
                  ].join(" ")}
                  dangerouslySetInnerHTML={{ __html: richHtml }}
                />
              ) : (
                <p className="text-sm text-ink-600">—</p>
              )}
            </div>

            {/* footer */}
            {firstHref ? (
              <div className="mt-5 flex">
                <a
                  href={firstHref}
                  {...(isInternalCta ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  className="rb-btn rb-btn-primary w-full sm:w-auto"
                >
                  En profiter →
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

