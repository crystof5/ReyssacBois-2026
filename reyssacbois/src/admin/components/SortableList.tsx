"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import {
  reorderCategoryChildrenAction,
  reorderCategoryProductsAction,
  reorderProductsAction,
  reorderTopCategoriesAction,
} from "@/admin/actions/order"
import { detachCategoryChildrenIfEmptyAction, detachProductsFromCategoryAction } from "@/admin/actions/categories"

export type SortableListItem = {
  id: string
  title: string
  subtitle?: string
  rightNote?: string
  isVisible?: boolean
  editHref?: string
  viewHref?: string
  /**
   * Si false, la case de sélection est désactivée (ex: sous-catégorie non vide).
   * Si undefined/true, l'item est détachable quand la fonctionnalité est active.
   */
  canDetach?: boolean
  detachDisabledReason?: string
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
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  // Mobile/tactile: HTML5 drag&drop ne fonctionne pas bien.
  // On garde le ré-ordonnancement via ↑ ↓ et on désactive le drag.
  useEffect(() => {
    try {
      const mq = window.matchMedia?.("(pointer: coarse)")
      if (!mq) return
      const apply = () => setIsCoarsePointer(Boolean(mq.matches))
      apply()
      mq.addEventListener?.("change", apply)
      return () => mq.removeEventListener?.("change", apply)
    } catch {
      // ignore
    }
  }, [])

  const ids = useMemo(() => items.map((i) => i.id), [items])
  const selectionEnabled = (saveKind === "categoryProducts" || saveKind === "categoryChildren") && !!scopeId
  const selectableIds = useMemo(() => {
    if (!selectionEnabled) return []
    if (saveKind === "categoryChildren") {
      return items.filter((x) => x.canDetach !== false).map((x) => x.id)
    }
    return items.map((x) => x.id)
  }, [items, saveKind, selectionEnabled])
  const allSelected = selectionEnabled && selectableIds.length > 0 && selectedIds.size === selectableIds.length
  const anySelected = selectionEnabled && selectedIds.size > 0

  const move = (from: number, to: number) => {
    if (from === to) return
    if (from < 0 || from >= items.length) return
    if (to < 0 || to >= items.length) return
    const next = items.slice()
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    setItems(next)
  }

  const toggleSelected = (id: string, checked: boolean) => {
    if (selectionEnabled && saveKind === "categoryChildren") {
      const it = items.find((x) => x.id === id)
      if (it && it.canDetach === false) return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(() => (checked ? new Set(selectableIds) : new Set()))
  }

  const onDetachSelected = () => {
    if (!scopeId) return
    if (selectedIds.size === 0) return
    setState(null)
    startTransition(async () => {
      const res =
        saveKind === "categoryChildren"
          ? await detachCategoryChildrenIfEmptyAction(scopeId, Array.from(selectedIds))
          : await detachProductsFromCategoryAction(scopeId, Array.from(selectedIds))
      if (res.ok) {
        const remove = new Set(selectedIds)
        setItems((prev) => prev.filter((x) => !remove.has(x.id)))
        setSelectedIds(new Set())
        setState({
          ok: true,
          message:
            saveKind === "categoryChildren"
              ? "Sous-catégories détachées (uniquement les sous-catégories vides)."
              : "Produits détachés de cette catégorie.",
        })
      } else {
        setState({ ok: false, message: res.message })
      }
    })
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
    <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description ? <p className="mt-1 text-xs text-ink-400">{description}</p> : null}
          {isCoarsePointer ? (
            <p className="mt-1 text-xs text-ink-400">
              Sur mobile, utilisez les boutons <span className="font-medium">↑</span> / <span className="font-medium">↓</span> (le glisser-déposer n’est pas fiable).
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {selectionEnabled ? (
            <button
              type="button"
              onClick={onDetachSelected}
              disabled={isPending || !anySelected}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 disabled:opacity-60"
              title={
                saveKind === "categoryChildren"
                  ? "Détache uniquement les sous-catégories vides (0 enfants, 0 produits)."
                  : "Retire le lien produits ↔ catégorie (les produits peuvent devenir orphelins s’ils n’ont plus d’autre catégorie)."
              }
            >
              Détacher ({selectedIds.size})
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-forest-700 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-700/30 disabled:opacity-60"
          >
            {isPending ? "Enregistrement…" : "Enregistrer l’ordre"}
          </button>
        </div>
      </div>

      {state?.message ? (
        <div
          className={`mt-3 rounded-xl border p-3 text-xs ${
            state.ok ? "border-green-200 bg-forest-050 text-forest-800" : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {selectionEnabled ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-600">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.currentTarget.checked)}
                disabled={selectableIds.length === 0}
              />
              Tout sélectionner {saveKind === "categoryChildren" ? "(vides)" : ""}
            </label>
            {saveKind === "categoryChildren" ? (
              <span className="hidden sm:inline text-[11px] text-ink-600">
                Seules les sous-catégories <span className="font-semibold">vides</span> sont détachables.
              </span>
            ) : null}
          </div>
          <span>
            Sélection: <span className="font-medium text-ink">{selectedIds.size}</span> / {selectableIds.length}
          </span>
        </div>
      ) : null}

      <ul className="mt-4 divide-y divide-black/5 rounded-2xl border border-line bg-surface shadow-sm ring-1 ring-black/5">
        {items.map((it, idx) => (
          <li
            key={it.id}
            className={`px-3 py-2.5 transition-colors ${
              dragId === it.id ? "bg-forest-050/60" : "bg-white hover:bg-surface-2/60"
            }`}
            draggable={!isCoarsePointer}
            onDragStart={
              isCoarsePointer
                ? undefined
                : (e) => {
                    setDragId(it.id)
                    try {
                      e.dataTransfer.effectAllowed = "move"
                      e.dataTransfer.setData("text/plain", it.id)
                    } catch {
                      // ignore
                    }
                  }
            }
            onDragOver={
              isCoarsePointer
                ? undefined
                : (e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                  }
            }
            onDrop={
              isCoarsePointer
                ? undefined
                : (e) => {
                    e.preventDefault()
                    const fromId = dragId ?? e.dataTransfer.getData("text/plain")
                    if (!fromId) return
                    const from = items.findIndex((x) => x.id === fromId)
                    const to = idx
                    setDragId(null)
                    move(from, to)
                  }
            }
            onDragEnd={isCoarsePointer ? undefined : () => setDragId(null)}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {selectionEnabled ? (
                (() => {
                  const disabled = saveKind === "categoryChildren" && it.canDetach === false
                  const title =
                    saveKind === "categoryChildren"
                      ? disabled
                        ? it.detachDisabledReason ?? "Détachable uniquement si la sous-catégorie est vide (0 enfants, 0 produits)."
                        : "Sélectionner pour détacher"
                      : "Sélectionner pour détacher"
                  return (
                <input
                  type="checkbox"
                  className="mt-1 sm:mt-0"
                  checked={selectedIds.has(it.id)}
                  onChange={(e) => toggleSelected(it.id, e.currentTarget.checked)}
                  aria-label={`Sélectionner ${it.title}`}
                  disabled={disabled}
                  title={title}
                />
                  )
                })()
              ) : null}
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-600 ${
                  isCoarsePointer ? "cursor-default" : "cursor-grab"
                }`}
                title={isCoarsePointer ? undefined : "Glisser pour réordonner"}
                aria-label={isCoarsePointer ? "Poignée" : "Glisser pour réordonner"}
              >
                ≡
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink truncate">{it.title}</p>
                  {typeof it.isVisible === "boolean" ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        it.isVisible ? "bg-forest-050 text-forest-800" : "bg-surface-2 text-ink-600"
                      }`}
                    >
                      {it.isVisible ? "Visible" : "Caché"}
                    </span>
                  ) : null}
                </div>
                {it.subtitle ? (
                  <p className="mt-0.5 text-xs text-ink-400 truncate">{it.subtitle}</p>
                ) : null}
                {it.rightNote ? (
                  <p className="mt-1 text-[11px] text-ink-600 sm:hidden">
                    {it.rightNote}
                  </p>
                ) : null}
              </div>

              {it.rightNote ? (
                <span className="hidden sm:inline text-xs text-ink-400">
                  {it.rightNote}
                </span>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 sm:gap-1">
                {isCoarsePointer ? (
                  <>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-xs text-ink-600 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/20 disabled:opacity-50"
                      onClick={() => move(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label="Monter"
                      title="Monter"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-xs text-ink-600 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/20 disabled:opacity-50"
                      onClick={() => move(idx, idx + 1)}
                      disabled={idx === items.length - 1}
                      aria-label="Descendre"
                      title="Descendre"
                    >
                      ↓
                    </button>
                  </>
                ) : null}

                {it.editHref ? (
                  <Link
                    className="ml-0.5 inline-flex items-center justify-center rounded-full bg-forest-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-700/30"
                    href={it.editHref}
                  >
                    Éditer
                  </Link>
                ) : null}
                {it.viewHref ? (
                  <Link
                    className="hidden sm:inline-flex items-center justify-center rounded border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2"
                    href={it.viewHref}
                  >
                    Voir →
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

