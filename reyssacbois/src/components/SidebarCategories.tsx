"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"

type Category = {
  id: string
  name: string
  slug: string
  children?: Category[]
}

function isInTree(category: Category, slug: string): boolean {
  if (category.slug === slug) return true
  return category.children?.some((c) => isInTree(c, slug)) ?? false
}

function findPathToSlug(nodes: Category[], slug: string): Category[] | null {
  for (const n of nodes) {
    if (n.slug === slug) return [n]
    const children = n.children ?? []
    if (!children.length) continue
    const childPath = findPathToSlug(children, slug)
    if (childPath) return [n, ...childPath]
  }
  return null
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-150 ${
        open ? "rotate-180" : "rotate-0"
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CategoryItem({
  category,
  activeSlug,
  level = 0,
}: {
  category: Category
  activeSlug?: string
  level?: number
}) {
  const shouldBeOpen = activeSlug
    ? isInTree(category, activeSlug)
    : false

  const [open, setOpen] = useState(shouldBeOpen)
  const children = category.children ?? []
  const isActive = category.slug === activeSlug

  // Si on navigue (activeSlug change), on synchronise l’état d’ouverture
  // pour que l’arbre s’ouvre automatiquement sur la catégorie active.
  useEffect(() => {
    setOpen(shouldBeOpen)
  }, [shouldBeOpen])

  return (
    <li>
      <div
        className={`group flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
          isActive
            ? "bg-forest-700 text-white shadow-sm"
            : "text-ink hover:bg-surface-2"
        }`}
        style={{ paddingLeft: level ? `${8 + level * 10}px` : undefined }}
      >
        <Link
          href={`/categories/${category.slug}`}
          className={`min-w-0 flex-1 truncate text-sm font-medium ${
            isActive ? "text-white" : "text-ink"
          }`}
          onClick={() => {
            // Si la catégorie a des enfants, on ouvre aussi au clic sur le nom.
            if (children.length > 0) setOpen(true)
          }}
        >
          {category.name}
        </Link>

        {children.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-forest-700/40 ${
              isActive
                ? "bg-white/15 text-white hover:bg-white/20"
                : "bg-surface-2 text-ink-600 hover:bg-line"
            }`}
            aria-label={open ? "Replier la catégorie" : "Déplier la catégorie"}
            aria-expanded={open}
          >
            <span className="opacity-90 group-hover:opacity-100">
              <ChevronIcon open={open} />
            </span>
          </button>
        )}
      </div>

      {open && children.length > 0 && (
        <ul className="mt-1 space-y-1 pl-3">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeSlug={activeSlug}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function SidebarCategories({
  categories,
}: {
  categories: Category[]
}) {
  const pathname = usePathname()
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const dragMode = useRef<"none" | "horizontal" | "vertical">("none")
  const rafId = useRef<number | null>(null)
  const nextDragX = useRef(0)
  const scrollYRef = useRef(0)

  // Desktop: mémoriser l’état replié/déplié
  useEffect(() => {
    try {
      const v = window.localStorage.getItem("rb_sidebar_collapsed")
      if (v === "1") setDesktopCollapsed(true)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem("rb_sidebar_collapsed", desktopCollapsed ? "1" : "0")
    } catch {
      // ignore
    }
  }, [desktopCollapsed])

  // Quand on navigue, on ferme le drawer mobile
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Reset drag state when opening/closing
  useEffect(() => {
    setDragX(0)
    setDragging(false)
    dragStart.current = null
    dragMode.current = "none"
    nextDragX.current = 0
    if (rafId.current != null) {
      window.cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [mobileOpen])

  // Lock scroll derrière le drawer (évite que la page défile derrière, surtout iOS)
  useEffect(() => {
    if (!mobileOpen) return

    const html = document.documentElement
    const body = document.body

    scrollYRef.current = window.scrollY || window.pageYOffset || 0

    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyPosition = body.style.position
    const prevBodyTop = body.style.top
    const prevBodyLeft = body.style.left
    const prevBodyRight = body.style.right
    const prevBodyWidth = body.style.width

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollYRef.current}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.width = "100%"

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.position = prevBodyPosition
      body.style.top = prevBodyTop
      body.style.left = prevBodyLeft
      body.style.right = prevBodyRight
      body.style.width = prevBodyWidth
      window.scrollTo(0, scrollYRef.current)
    }
  }, [mobileOpen])

  // Fermer au clavier (Escape)
  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  function scheduleDrag(x: number) {
    nextDragX.current = x
    if (rafId.current != null) return
    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null
      setDragX(nextDragX.current)
    })
  }

  function closeOrReset() {
    const threshold = -70
    if (dragMode.current === "horizontal" && dragX <= threshold) {
      setMobileOpen(false)
      return
    }
    scheduleDrag(0)
    setDragging(false)
    dragStart.current = null
    dragMode.current = "none"
  }

  const activeSlug = useMemo(() => {
    // /categories/[slug]
    if (pathname.startsWith("/categories/")) {
      const slug = pathname.split("/")[2]
      return slug || undefined
    }
    return undefined
  }, [pathname])

  const activePath = useMemo(() => {
    if (!activeSlug) return [] as Category[]
    return findPathToSlug(categories, activeSlug) ?? []
  }, [activeSlug, categories])

  const compactPath = useMemo(() => {
    if (!activePath.length) return [] as Category[]
    // sur mobile: garder ça compact (dernier 1–2 niveaux)
    return activePath.slice(-2)
  }, [activePath])

  return (
    <>
      {/* Mobile: barre sticky (catégories + fil d’Ariane compact) */}
      <div className="md:hidden sticky top-16 z-30">
        <div className="flex items-center gap-2 rounded border border-line bg-surface px-3 py-2 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-700/40"
            aria-label="Ouvrir les catégories"
            title="Catégories"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <nav aria-label="Fil d’Ariane" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-1 text-xs text-ink-600">
              <li className="min-w-0">
                <Link href="/produits" className="font-semibold text-ink hover:underline underline-offset-4">
                  Catalogue
                </Link>
              </li>

              {activePath.length > 2 && (
                <li className="text-line-strong" aria-hidden>
                  / …
                </li>
              )}

              {compactPath.map((c) => (
                <li key={`crumb:${c.id}`} className="flex min-w-0 items-center gap-1">
                  <span className="text-line-strong" aria-hidden>
                    /
                  </span>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="rb-clamp-1 max-w-[22ch] font-medium text-ink-600 hover:text-ink hover:underline underline-offset-4"
                    title={c.name}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Desktop: sidebar */}
      <aside
        className={`hidden md:block shrink-0 ${
          desktopCollapsed ? "w-16" : "w-72"
        }`}
      >
        <div className="md:sticky md:top-24">
          {desktopCollapsed ? (
            <div className="rb-surface p-2">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDesktopCollapsed(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-700/40"
                  aria-label="Ouvrir le menu catégories"
                  title="Ouvrir"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <Link
                  href="/produits"
                  className="text-[11px] font-medium text-ink-600 hover:text-ink"
                  title="Catalogue"
                >
                  Catalogue
                </Link>
              </div>
            </div>
          ) : (
            <div className="rb-surface p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-ink">
                  Catégories
                </h2>
                <div className="flex items-center gap-2">
                  <Link
                    href="/produits"
                    className="text-xs font-medium text-ink-600 hover:text-ink underline-offset-4 hover:underline"
                  >
                    Catalogue
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDesktopCollapsed(true)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink transition hover:bg-line focus:outline-none focus:ring-2 focus:ring-forest-700/40"
                    aria-label="Réduire le menu catégories"
                    title="Réduire"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                      <path
                        d="M14.5 6.5 9 12l5.5 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <ul className="space-y-1">
                {categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    activeSlug={activeSlug}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className={`absolute left-0 top-0 z-50 flex h-[100dvh] w-[85vw] max-w-sm flex-col border-r border-line bg-surface text-ink shadow-[var(--shadow-pop)] will-change-transform ${
              dragging ? "" : "transition-transform duration-200"
            }`}
            style={{ transform: `translate3d(${Math.min(0, dragX)}px, 0, 0)` }}
            onTouchStart={(e) => {
              const t = e.touches[0]
              if (!t) return
              dragStart.current = { x: t.clientX, y: t.clientY }
              dragMode.current = "none"
              setDragging(false)
            }}
            onTouchMove={(e) => {
              const start = dragStart.current
              const t = e.touches[0]
              if (!start || !t) return

              const dx = t.clientX - start.x
              const dy = t.clientY - start.y
              const adx = Math.abs(dx)
              const ady = Math.abs(dy)

              if (dragMode.current === "none") {
                // On attend un vrai geste avant de décider l’axe.
                if (adx > 10 && adx > ady + 6) {
                  dragMode.current = "horizontal"
                  setDragging(true)
                } else if (ady > 10) {
                  dragMode.current = "vertical"
                } else {
                  return
                }
              }

              if (dragMode.current === "horizontal") {
                // Empêche le scroll vertical quand on swipe horizontal pour fermer.
                e.preventDefault()
                scheduleDrag(dx < 0 ? dx : 0)
              }
            }}
            onTouchEnd={() => {
              closeOrReset()
            }}
            onTouchCancel={() => {
              scheduleDrag(0)
              setDragging(false)
              dragStart.current = null
              dragMode.current = "none"
            }}
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/android-chrome-192x192.png"
                  alt="Reyssac Bois"
                  className="h-8 w-8 rounded-full"
                />
                <p className="font-semibold">Catégories</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
              >
                Fermer
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain p-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <ul className="space-y-4">
                {categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    activeSlug={activeSlug}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
