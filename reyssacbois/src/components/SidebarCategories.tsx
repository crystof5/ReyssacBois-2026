"use client"

import Link from "next/link"
import { useState } from "react"

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

  return (
    <li>
      <div className="flex items-center justify-between">
        <Link
          href={`/categories/${category.slug}`}
          className="font-semibold hover:text-green-700"
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
  activeSlug,
}: {
  categories: Category[]
  activeSlug?: string
}) {
  return (
    <aside className="hidden md:block w-64 border-r pr-4">
      <h2 className="font-semibold mb-4">Catégories</h2>

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
