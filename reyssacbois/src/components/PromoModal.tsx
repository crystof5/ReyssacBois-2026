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
    return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-green-800 underline underline-offset-4 hover:text-green-900">${safeLabel}</a>`
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
        className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_15%,rgba(0,0,0,0.35),rgba(0,0,0,0.78))] backdrop-blur-[3px]"
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
            "rounded-[36px] p-[1px]",
            "bg-[conic-gradient(from_180deg_at_50%_50%,#15803d,#16a34a,#f59e0b,#15803d)]",
            "shadow-[0_40px_120px_-55px_rgba(0,0,0,0.85)]",
            "transition duration-200 ease-out will-change-transform",
            entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          {/* fondu autour du cadre (évite l’arrêt “abrupt”) */}
          <div className="pointer-events-none absolute -inset-8 rounded-[44px] bg-[conic-gradient(from_180deg_at_50%_50%,#15803d,#16a34a,#f59e0b,#15803d)] opacity-35 blur-2xl" />

          <div className="relative overflow-hidden rounded-[35px] bg-white/90 ring-1 ring-black/10 backdrop-blur">
            {/* fondu sur les bords internes */}
            <div className="pointer-events-none absolute inset-0 rounded-[35px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" />
            <div className="pointer-events-none absolute inset-0 rounded-[35px] bg-[radial-gradient(120%_120%_at_50%_50%,transparent_68%,rgba(0,0,0,0.10)_100%)]" />

            {/* sticker */}
            <div className="absolute left-5 top-5 z-20">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm ring-1 ring-black/10">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Nouveau
              </div>
            </div>

            {/* close */}
            <div className="absolute right-4 top-4 z-20">
              <button
                type="button"
                aria-label="Fermer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm ring-1 ring-black/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-600/30"
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
                <div className="h-56 sm:h-64 w-full overflow-hidden">
                  <Media
                    src={promo.image.src}
                    alt={promo.image.alt || promo.title || "Promo"}
                    className="h-full w-full"
                  />
                  {/* voile très léger, pas blanc */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.00),rgba(0,0,0,0.18))]" />
                </div>
              ) : (
                <div className="h-44 sm:h-52 w-full bg-[radial-gradient(900px_circle_at_30%_10%,rgba(22,163,74,0.35),transparent_55%),radial-gradient(900px_circle_at_70%_10%,rgba(245,158,11,0.25),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.55))]" />
              )}
            </div>

            {/* content */}
            <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="flex items-center gap-2">
                {isPreview ? (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
                    Aperçu admin (non visible publiquement)
                  </span>
                ) : null}
              </div>

              <h3 className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
                {promo.title.trim() ? promo.title : "Information"}
              </h3>

              {promo.image?.alt?.trim() ? (
                <p className="mt-1 text-xs text-gray-600">{promo.image.alt}</p>
              ) : null}

              <div className="mt-4 max-h-[45vh] overflow-y-auto pr-1">
                {richHtml.trim() ? (
                  <div
                    className={[
                      "text-[15px] leading-relaxed text-gray-800",
                      "space-y-3",
                      "[&_p]:m-0",
                      "[&_strong]:font-extrabold [&_strong]:text-gray-900",
                      "[&_em]:italic",
                      "[&_a]:font-extrabold [&_a]:text-green-800 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-green-900",
                    ].join(" ")}
                    dangerouslySetInnerHTML={{ __html: richHtml }}
                  />
                ) : (
                  <p className="text-sm text-gray-600">—</p>
                )}
              </div>

              {/* footer */}
              {firstHref ? (
                <div className="mt-5 flex">
                  <a
                    href={firstHref}
                    {...(isInternalCta ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    className="inline-flex w-full items-center justify-center rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 sm:w-auto"
                  >
                    En profiter →
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

