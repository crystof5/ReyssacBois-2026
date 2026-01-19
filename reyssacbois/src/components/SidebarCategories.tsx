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
      <div className="flex items-center justify-between">
        <Link
          href={`/categories/${category.slug}`}
          className="font-semibold hover:text-green-700"
          onClick={() => {
            // Si la catégorie a des enfants, on ouvre aussi au clic sur le nom.
            if (children.length > 0) setOpen(true)
          }}
        >
          {category.name}
        </Link>

        {children.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="text-xs px-2"
            aria-label="Toggle category"
          >
            {open ? "−" : "+"}
          </button>
        )}
      </div>

      {open && children.length > 0 && (
        <ul className="ml-4 mt-2 space-y-1 text-sm">
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
  const dragStartX = useRef<number | null>(null)

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
    dragStartX.current = null
  }, [mobileOpen])

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
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
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
            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 hover:bg-gray-50"
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

        {compact ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setCompact(false)}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-900 hover:bg-gray-50"
              aria-label="Ouvrir le menu catégories"
              title="Ouvrir"
            >
              ☰
            </button>
          </div>
        ) : (
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
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[85vw] max-w-sm bg-white shadow-xl ${
              dragging ? "" : "transition-transform duration-200"
            }`}
            style={{ transform: `translateX(${Math.min(0, dragX)}px)` }}
            onPointerDown={(e) => {
              // swipe-to-close: start tracking
              dragStartX.current = e.clientX
              setDragging(true)
              ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (dragStartX.current == null) return
              const dx = e.clientX - dragStartX.current
              // only allow left drag (negative)
              if (dx < 0) setDragX(dx)
              else setDragX(0)
            }}
            onPointerUp={() => {
              const threshold = -80
              if (dragX <= threshold) {
                setMobileOpen(false)
              } else {
                setDragX(0)
              }
              setDragging(false)
              dragStartX.current = null
            }}
            onPointerCancel={() => {
              setDragX(0)
              setDragging(false)
              dragStartX.current = null
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
                <p className="font-semibold text-gray-900">Catégories</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>

            <div className="h-full overflow-y-auto p-4">
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
