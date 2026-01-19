"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import {
  reorderCategoryChildrenAction,
  reorderCategoryProductsAction,
  reorderProductsAction,
  reorderTopCategoriesAction,
} from "@/admin/actions/order"

export type SortableListItem = {
  id: string
  title: string
  subtitle?: string
  rightNote?: string
  isVisible?: boolean
  editHref?: string
  viewHref?: string
}

type ActionResult = { ok: true } | { ok: false; message: string }

export default function SortableList({
  title,
  description,
  items: initialItems,
  saveKind,
  scopeId,
}: {
  title: string
  description?: string
  items: SortableListItem[]
  saveKind: "topCategories" | "categoryChildren" | "categoryProducts" | "products"
  scopeId?: string
}) {
  const [items, setItems] = useState<SortableListItem[]>(initialItems)
  const [dragId, setDragId] = useState<string | null>(null)
  const [state, setState] = useState<{ ok?: boolean; message?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const ids = useMemo(() => items.map((i) => i.id), [items])

  const move = (from: number, to: number) => {
    if (from === to) return
    if (from < 0 || from >= items.length) return
    if (to < 0 || to >= items.length) return
    const next = items.slice()
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    setItems(next)
  }

  const onSave = () => {
    setState(null)
    startTransition(async () => {
      let res: ActionResult
      if (saveKind === "topCategories") {
        res = await reorderTopCategoriesAction(ids)
      } else if (saveKind === "products") {
        res = await reorderProductsAction(ids)
      } else if (saveKind === "categoryChildren") {
        if (!scopeId) {
          res = { ok: false, message: "Parent manquant." }
        } else {
          res = await reorderCategoryChildrenAction(scopeId, ids)
        }
      } else {
        // categoryProducts
        if (!scopeId) {
          res = { ok: false, message: "Catégorie manquante." }
        } else {
          res = await reorderCategoryProductsAction(scopeId, ids)
        }
      }
      if (res.ok) setState({ ok: true, message: "Ordre enregistré." })
      else setState({ ok: false, message: res.message })
    })
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description ? <p className="mt-1 text-xs text-gray-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-green-800 disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer l’ordre"}
        </button>
      </div>

      {state?.message ? (
        <div
          className={`mt-3 rounded-xl border p-3 text-xs ${
            state.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
        {items.map((it, idx) => (
          <li
            key={it.id}
            className={`flex items-center gap-3 px-3 py-2.5 ${
              dragId === it.id ? "bg-green-50/60" : "bg-white"
            }`}
            draggable
            onDragStart={(e) => {
              setDragId(it.id)
              try {
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/plain", it.id)
              } catch {
                // ignore
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
            }}
            onDrop={(e) => {
              e.preventDefault()
              const fromId = dragId ?? e.dataTransfer.getData("text/plain")
              if (!fromId) return
              const from = items.findIndex((x) => x.id === fromId)
              const to = idx
              setDragId(null)
              move(from, to)
            }}
            onDragEnd={() => setDragId(null)}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-grab"
              title="Glisser pour réordonner"
              aria-label="Glisser pour réordonner"
            >
              ≡
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-gray-900 truncate">{it.title}</p>
                {typeof it.isVisible === "boolean" ? (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      it.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {it.isVisible ? "Visible" : "Caché"}
                  </span>
                ) : null}
              </div>
              {it.subtitle ? (
                <p className="mt-0.5 text-xs text-gray-500 truncate">{it.subtitle}</p>
              ) : null}
            </div>

            {it.rightNote ? (
              <span className="hidden sm:inline text-xs text-gray-500">
                {it.rightNote}
              </span>
            ) : null}

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                aria-label="Monter"
                title="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === items.length - 1}
                aria-label="Descendre"
                title="Descendre"
              >
                ↓
              </button>
            </div>

            {it.editHref ? (
              <Link className="ml-1 text-xs text-gray-900 hover:underline" href={it.editHref}>
                Éditer
              </Link>
            ) : null}
            {it.viewHref ? (
              <Link className="ml-2 text-xs text-green-700 hover:underline" href={it.viewHref}>
                Voir →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

