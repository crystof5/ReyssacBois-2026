"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

type ApiCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  isVisible: boolean
  parent: { name: string; slug: string } | null
}

type ApiProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  isVisible: boolean
  section: string | null
  length: string | null
  width: string | null
  type: string | null
  categories: { category: { name: string; slug: string } }[]
}

type ApiResponse =
  | { ok: true; q: string; categories: ApiCategory[]; products: ApiProduct[] }
  | { ok: false; error: string }

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

function MagnifierIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.3 16.3 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 animate-spin ${className}`}
    >
      <path
        d="M12 3a9 9 0 1 1-8.66 11.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function SearchBar({
  mode = "public",
  placeholder,
  className = "",
  onSelectResult,
  showHint = true,
}: {
  mode?: "public" | "admin"
  placeholder?: string
  className?: string
  onSelectResult?: () => void
  showHint?: boolean
}) {
  const [q, setQ] = useState("")
  const debounced = useDebouncedValue(q, 220)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cats, setCats] = useState<ApiCategory[]>([])
  const [prods, setProds] = useState<ApiProduct[]>([])
  const [open, setOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const cacheRef = useRef<Map<string, { c: ApiCategory[]; p: ApiProduct[] }>>(new Map())

  const trimmed = q.trim()
  const hasQuery = trimmed.length >= 2

  useEffect(() => {
    if (!hasQuery) {
      setCats([])
      setProds([])
      setError(null)
      setLoading(false)
      if (abortRef.current) abortRef.current.abort()
      return
    }

    const key = `${mode}:${debounced.trim().toLowerCase()}`
    const cached = cacheRef.current.get(key)
    if (cached) {
      setCats(cached.c)
      setProds(cached.p)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const url = `/api/search?q=${encodeURIComponent(debounced)}&limit=8${
      mode === "admin" ? "&admin=1" : ""
    }`

    fetch(url, { signal: controller.signal })
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((json) => {
        if (!json || typeof json !== "object") throw new Error("Réponse invalide")
        if (json.ok !== true) throw new Error("Recherche indisponible.")
        cacheRef.current.set(key, { c: json.categories, p: json.products })
        setCats(json.categories)
        setProds(json.products)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return
        setCats([])
        setProds([])
        setError(e instanceof Error ? e.message : "Recherche indisponible.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [debounced, hasQuery, mode])

  const resultsCount = cats.length + prods.length
  const empty = hasQuery && !loading && !error && resultsCount === 0

  const ph =
    placeholder ??
    (mode === "admin"
      ? "Rechercher un produit ou une catégorie…"
      : "Rechercher dans les produits et catégories…")

  const headerClass =
    mode === "admin"
      ? "bg-white border border-gray-200 text-gray-900"
      : "bg-white/10 border border-white/20 text-white placeholder:text-white/70"

  const inputClass =
    mode === "admin"
      ? "placeholder:text-gray-400"
      : "placeholder:text-white/70"

  const panelClass =
    mode === "admin"
      ? "border-gray-200 bg-white text-gray-900"
      : "border-white/15 bg-white/95 text-gray-900"

  const rightHint = useMemo(() => {
    if (!hasQuery) return "Tape au moins 2 caractères"
    if (loading) return "Recherche…"
    if (error) return error
    if (empty) return "Aucun résultat"
    return `${resultsCount} résultat${resultsCount > 1 ? "s" : ""}`
  }, [empty, error, hasQuery, loading, resultsCount])

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 backdrop-blur ${headerClass}`}
      >
        <span className={mode === "admin" ? "text-gray-500" : "text-white/90"}>
          <MagnifierIcon />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false)
              ;(e.currentTarget as HTMLInputElement).blur()
            }
          }}
          onBlur={() => {
            // laisse le temps au clic sur un lien
            window.setTimeout(() => setOpen(false), 150)
          }}
          className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${inputClass}`}
          placeholder={ph}
          aria-label={ph}
        />
        {showHint ? (
          loading ? (
            <span className={mode === "admin" ? "text-gray-500" : "text-white/80"} aria-label="Recherche en cours">
              <Spinner />
            </span>
          ) : (
            <span className={mode === "admin" ? "text-xs text-gray-500" : "text-xs text-white/80"}>
              {rightHint}
            </span>
          )
        ) : null}
      </div>

      {open && hasQuery && (
        <div
          className={`absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border shadow-lg ring-1 ring-black/5 ${panelClass}`}
        >
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {cats.length > 0 && (
              <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Catégories
              </div>
            )}
            <ul className="space-y-1">
              {cats.map((c) => {
                const viewHref = `/categories/${c.slug}`
                const adminHref = `/admin/categories/${c.id}`
                return (
                  <li key={`c:${c.id}`}>
                    <Link
                      href={mode === "admin" ? adminHref : viewHref}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-gray-50"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setOpen(false)
                        onSelectResult?.()
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-800">
                            Catégorie
                          </span>
                          {!c.isVisible && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                              Cachée
                            </span>
                          )}
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {c.name}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-gray-500">
                          {c.parent?.name ? `${c.parent.name} · ` : ""}/{c.slug}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">→</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {prods.length > 0 && (
              <div className="mt-3 px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Produits
              </div>
            )}
            <ul className="space-y-1">
              {prods.map((p) => {
                const viewHref = `/produits/${p.slug}`
                const adminHref = `/admin/produits/${p.id}`
                const meta = [p.section, p.width, p.length, p.type].filter(Boolean).join(" • ")
                const catHint = p.categories[0]?.category?.name
                return (
                  <li key={`p:${p.id}`}>
                    <Link
                      href={mode === "admin" ? adminHref : viewHref}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-gray-50"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setOpen(false)
                        onSelectResult?.()
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                            Produit
                          </span>
                          {!p.isVisible && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                              Caché
                            </span>
                          )}
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {p.name}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-gray-500">
                          {meta || catHint ? `${meta || catHint} · ` : ""}/{p.slug}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">→</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {error && (
              <div className="px-3 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {empty && (
              <div className="px-3 py-3 text-sm text-gray-600">
                Aucun résultat.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

