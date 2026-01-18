"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
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

  const activeSlug = useMemo(() => {
    // /categories/[slug]
    if (pathname.startsWith("/categories/")) {
      const slug = pathname.split("/")[2]
      return slug || undefined
    }
    return undefined
  }, [pathname])

  return (
    <aside
      className={`hidden md:block border-r pr-4 ${
        compact ? "w-48" : "w-64"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className={`font-semibold ${compact ? "text-sm" : ""}`}>
          Catégories
        </h2>
        <button
          type="button"
          onClick={() => setCompact((v) => !v)}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          aria-label={compact ? "Agrandir la sidebar" : "Réduire la sidebar"}
          title={compact ? "Agrandir" : "Réduire"}
        >
          {compact ? "›" : "‹"}
        </button>
      </div>

      <ul className="space-y-4">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            activeSlug={activeSlug}
          />
        ))}
      </ul>
    </aside>
  )
}
