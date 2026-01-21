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

function CategoryItem({
  category,
  activeSlug,
}: {
  category: Category
  activeSlug?: string
}) {
  const shouldBeOpen = activeSlug
    ? isInTree(category, activeSlug)
    : false

  const [open, setOpen] = useState(shouldBeOpen)
  const children = category.children ?? []

  // Si on navigue (activeSlug change), on synchronise l’état d’ouverture
  // pour que l’arbre s’ouvre automatiquement sur la catégorie active.
  useEffect(() => {
    setOpen(shouldBeOpen)
  }, [shouldBeOpen])

  return (
    <li>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/categories/${category.slug}`}
          className={`min-w-0 flex-1 truncate font-semibold text-gray-900 hover:text-green-700 ${
            category.slug === activeSlug ? "text-green-700" : ""
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-base font-semibold leading-none text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600/30"
            aria-label="Toggle category"
            aria-expanded={open}
          >
            <span aria-hidden>{open ? "−" : "+"}</span>
          </button>
        )}
      </div>

      {open && children.length > 0 && (
        <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-700">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/categories/${child.slug}`}
                className={`block hover:text-green-700 ${
                  child.slug === activeSlug
                    ? "text-green-700 font-medium"
                    : ""
                }`}
              >
                {child.name}
              </Link>
            </li>
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
  const [compact, setCompact] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const dragMode = useRef<"none" | "horizontal" | "vertical">("none")
  const rafId = useRef<number | null>(null)
  const nextDragX = useRef(0)
  const scrollYRef = useRef(0)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("sidebarCompact")
      if (stored === "1") setCompact(true)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem("sidebarCompact", compact ? "1" : "0")
    } catch {
      // ignore
    }
  }, [compact])

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

  return (
    <>
      {/* Mobile: bouton pour ouvrir le drawer */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600/30"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-800">
            ☰
          </span>
          Catégories
        </button>
      </div>

      {/* Desktop: sidebar (réductible en rail) */}
      <aside
        className={`hidden md:flex shrink-0 flex-col border-r pr-4 ${
          compact ? "w-14" : "w-64"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          {!compact ? (
            <h2 className="font-semibold">Catégories</h2>
          ) : (
            <span className="sr-only">Catégories</span>
          )}

          <button
            type="button"
            onClick={() => setCompact((v) => !v)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600/30"
            aria-label={compact ? "Ouvrir le menu catégories" : "Réduire le menu catégories"}
            title={compact ? "Ouvrir" : "Réduire"}
          >
            {compact ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/img/android-chrome-192x192.png"
                alt="Menu"
                className="h-6 w-6 rounded-full"
              />
            ) : (
              "‹"
            )}
          </button>
        </div>

        {!compact && (
          <ul className="space-y-4">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                activeSlug={activeSlug}
              />
            ))}
          </ul>
        )}
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
