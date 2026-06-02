"use client"

import { useEffect, useMemo, useState } from "react"

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

function buildChildrenMap(categories: CategoryNode[]) {
  const m = new Map<string, CategoryNode[]>()
  for (const c of categories) {
    if (!c.parentId) continue
    const arr = m.get(c.parentId) ?? []
    arr.push(c)
    m.set(c.parentId, arr)
  }
  for (const [, arr] of m) arr.sort(sortFr)
  return m
}

function collectDescendants(childrenById: Map<string, CategoryNode[]>, rootId: string) {
  const out = new Set<string>()
  const stack = [rootId]
  while (stack.length) {
    const cur = stack.pop()!
    const kids = childrenById.get(cur) ?? []
    for (const k of kids) {
      if (out.has(k.id)) continue
      out.add(k.id)
      stack.push(k.id)
    }
  }
  return out
}

export default function CategoryParentSelector({
  categories,
  currentId,
  inputName = "parentId",
  initialParentId,
}: {
  categories: CategoryNode[]
  currentId: string
  inputName?: string
  initialParentId: string | null
}) {
  const childrenById = useMemo(() => buildChildrenMap(categories), [categories])

  const byId = useMemo(() => {
    const m = new Map<string, CategoryNode>()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  const roots = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .slice()
      .sort(sortFr)
  }, [categories])

  const orphans = useMemo(() => {
    return categories
      .filter((c) => !!c.parentId && !byId.has(c.parentId))
      .slice()
      .sort(sortFr)
  }, [byId, categories])

  const disabledIds = useMemo(() => {
    const d = collectDescendants(childrenById, currentId)
    d.add(currentId)
    return d
  }, [childrenById, currentId])

  const [selected, setSelected] = useState<string>(() => initialParentId ?? "")

  // Important: si on navigue entre catégories (App Router), le composant peut rester monté.
  // On resynchronise la sélection quand l'initial change (sinon ça peut afficher “Aucun parent” à tort).
  useEffect(() => {
    setSelected(initialParentId ?? "")
  }, [initialParentId])

  const renderNode = (node: CategoryNode, level: number) => {
    const children = childrenById.get(node.id) ?? []
    const isDisabled = disabledIds.has(node.id)

    return (
      <div key={node.id} className={level > 0 ? "pl-6" : ""}>
        <label
          className={`flex items-start gap-2 text-sm ${isDisabled ? "opacity-50" : ""}`}
          title={isDisabled ? "Impossible (catégorie elle-même / descendant)" : undefined}
        >
          <input
            type="radio"
            name={inputName}
            value={node.id}
            checked={selected === node.id}
            onChange={() => setSelected(node.id)}
            className="mt-0.5"
            disabled={isDisabled}
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
      <div className="rounded-2xl border border-line bg-surface p-3 shadow-sm ring-1 ring-black/5">
        <label className="flex items-start gap-2 text-sm font-medium text-ink">
          <input
            type="radio"
            name={inputName}
            value=""
            checked={selected === ""}
            onChange={() => setSelected("")}
            className="mt-0.5"
          />
          <span>(Aucun parent)</span>
        </label>
        <p className="mt-1 text-xs text-ink-600">
          Astuce: pour réordonner les sous-catégories, utilise le glisser-déposer dans la page du parent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roots.map((root) => (
          <div
            key={root.id}
            className="rounded-2xl border border-line bg-surface p-3 shadow-sm ring-1 ring-black/5"
          >
            {renderNode(root, 0)}
          </div>
        ))}
      </div>

      {orphans.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-semibold text-amber-900">
            Catégories orphelines (parent manquant)
          </p>
          <p className="mt-1 text-xs text-amber-900/80">
            Corrige d’abord les liens cassés (parent introuvable) pour clarifier l’arborescence.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {orphans.map((c) => (
              <label key={c.id} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name={inputName}
                  value={c.id}
                  checked={selected === c.id}
                  onChange={() => setSelected(c.id)}
                  className="mt-0.5"
                  disabled={disabledIds.has(c.id)}
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

