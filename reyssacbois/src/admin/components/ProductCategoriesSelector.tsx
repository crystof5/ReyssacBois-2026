"use client"

import { useMemo, useState } from "react"

type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  sortOrder: number
}

function sortFr(a: CategoryNode, b: CategoryNode) {
  const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  if (byOrder !== 0) return byOrder
  return a.name.localeCompare(b.name, "fr")
}

export default function ProductCategoriesSelector({
  categories,
  initialSelectedIds,
}: {
  categories: CategoryNode[]
  initialSelectedIds: string[]
}) {
  const buildInitialSelected = (ids: string[]) => {
    // IMPORTANT:
    // On n'ajoute PAS automatiquement les parents.
    // Cela permet de rattacher un produit uniquement à une sous-catégorie (sans "remonter" au parent).
    return new Set(ids.filter(Boolean))
  }

  const [selected, setSelected] = useState<Set<string>>(() =>
    buildInitialSelected(initialSelectedIds),
  )

  const byId = useMemo(() => {
    const m = new Map<string, CategoryNode>()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  const childrenById = useMemo(() => {
    const m = new Map<string, CategoryNode[]>()
    for (const c of categories) {
      if (!c.parentId) continue
      const arr = m.get(c.parentId) ?? []
      arr.push(c)
      m.set(c.parentId, arr)
    }
    for (const [, arr] of m) arr.sort(sortFr)
    return m
  }, [categories])

  const roots = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .slice()
      .sort(sortFr)
  }, [categories])

  const orphans = useMemo(() => {
    // Catégories avec parentId mais parent manquant (liens cassés/imports).
    return categories
      .filter((c) => !!c.parentId && !byId.has(c.parentId))
      .slice()
      .sort(sortFr)
  }, [byId, categories])

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        // Chaque case est indépendante : on peut garder un enfant coché même si le parent est décoché.
        next.delete(id)
      }
      return next
    })
  }

  const renderNode = (node: CategoryNode, level: number) => {
    const checked = selected.has(node.id)
    const children = childrenById.get(node.id) ?? []

    return (
      <div key={node.id} className={level > 0 ? "pl-6" : ""}>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="categoryIds"
            value={node.id}
            checked={checked}
            onChange={(e) => toggle(node.id, e.currentTarget.checked)}
            className="mt-0.5"
          />
          <span className={level === 0 ? "font-semibold text-ink" : "text-ink"}>
            {node.name}
          </span>
        </label>

        {children.length ? (
          <div className="mt-2 space-y-2">
            {children.map((c) => renderNode(c, level + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roots.map((root) => (
          <div
            key={root.id}
            className="rounded-xl border border-line bg-white p-3"
          >
            {renderNode(root, 0)}
          </div>
        ))}
      </div>

      {orphans.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">
            Catégories orphelines (parent manquant)
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {orphans.map((c) => (
              <label key={c.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={c.id}
                  checked={selected.has(c.id)}
                  onChange={(e) => toggle(c.id, e.currentTarget.checked)}
                  className="mt-0.5"
                />
                <span className="text-amber-950">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

