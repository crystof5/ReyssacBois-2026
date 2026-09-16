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
  const inActivePath = activeSlug ? isInTree(category, activeSlug) : false
  const children = category.children ?? []
  const hasChildren = children.length > 0
  const isActive = category.slug === activeSlug
  const [open, setOpen] = useState(inActivePath)

  // Quand on navigue, la branche de la catégorie active s'ouvre automatiquement.
  useEffect(() => {
    if (inActivePath) setOpen(true)
  }, [inActivePath])

  return (
    <li>
      <div
        className={`group relative flex items-stretch rounded-lg transition-colors ${
          isActive
            ? "bg-green-50 text-green-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(20,83,45,0.12)] ring-1 ring-green-700/10"
            : inActivePath
              ? "text-gray-900"
              : "text-gray-700 hover:bg-stone-100 hover:text-gray-900"
        }`}
      >
        {isActive && (
          <span aria-hidden="true" className="absolute inset-y-1 left-0 w-1 rounded-full bg-green-700" />
        )}
        <Link
          href={`/categories/${category.slug}`}
          aria-current={isActive ? "page" : undefined}
          className={`min-w-0 flex-1 py-2 pl-3 pr-2 leading-snug transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 rounded-lg ${
            level === 0 ? "text-[15px]" : "text-sm"
          } ${isActive || inActivePath ? "font-semibold" : "font-medium"}`}
          onClick={() => {
            if (hasChildren) setOpen(true)
          }}
        >
          {category.name}
        </Link>

        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition active:scale-90 hover:bg-stone-200/70 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            aria-label={`${open ? "Replier" : "Déplier"} ${category.name}`}
            aria-expanded={open}
          >
            <ChevronIcon open={open} />
          </button>
        )}
      </div>

      {hasChildren && (
        // Sous-catégories toujours présentes dans le HTML (liens explorables), repliées en CSS.
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
          inert={!open}
        >
          <div className="overflow-hidden">
            <ul className="my-1 ml-3 space-y-0.5 border-l border-stone-200 pl-2">
              {children.map((child) => (
                <CategoryItem key={child.id} category={child} activeSlug={activeSlug} level={level + 1} />
              ))}
            </ul>
          </div>
        </div>
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
        <div className="rb-depth rb-lift flex items-center gap-2 rounded-xl border border-black/[0.07] px-3 py-2 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rb-press inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600/30"
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
            <ol className="flex min-w-0 items-center gap-1 text-xs text-gray-700">
              <li className="min-w-0">
                <Link href="/produits" className="font-semibold text-gray-900 hover:underline underline-offset-4">
                  Catalogue
                </Link>
              </li>

              {activePath.length > 2 && (
                <li className="text-gray-400" aria-hidden>
                  / …
                </li>
              )}

              {compactPath.map((c) => (
                <li key={`crumb:${c.id}`} className="flex min-w-0 items-center gap-1">
                  <span className="text-gray-400" aria-hidden>
                    /
                  </span>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="rb-clamp-1 max-w-[22ch] font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4"
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
            <div className="rb-depth rb-lift rounded-xl border border-black/[0.07] p-2 backdrop-blur">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDesktopCollapsed(false)}
                  className="rb-press inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600/30"
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
                  className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
                  title="Catalogue"
                >
                  Catalogue
                </Link>
              </div>
            </div>
          ) : (
            <div className="rb-depth rb-lift rounded-xl border border-black/[0.07] p-3 backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-2 border-b border-stone-200 px-1 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                  Catégories
                </h2>
                <div className="flex items-center gap-2">
                  <Link
                    href="/produits"
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline"
                  >
                    Catalogue
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDesktopCollapsed(true)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-stone-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/30"
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

              <ul className="space-y-0.5">
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
            className={`absolute left-0 top-0 z-50 flex h-[100dvh] w-[85vw] max-w-sm flex-col bg-white text-gray-900 shadow-xl ring-1 ring-black/5 will-change-transform ${
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
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
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
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                Fermer
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain p-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <ul className="space-y-0.5">
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
