"use client"

import type { ReactNode } from "react"

export const inputClass =
  "w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:border-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-700/20"

export function newClientId(prefix: string) {
  try {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  } catch {
    return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  }
}

export function Panel({
  title,
  subtitle,
  icon,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  icon?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rb-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon ? (
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-forest-050 text-lg">
              {icon}
            </span>
          ) : null}
          <div>
            <h3 className="font-heading text-base font-bold text-ink">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-xs text-ink-600">{subtitle}</p> : null}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function Field({
  label,
  hint,
  children,
  counter,
}: {
  label: string
  hint?: string
  children: ReactNode
  counter?: ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-end justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {counter}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs text-ink-400">{hint}</span> : null}
    </label>
  )
}

/** Compteur de caractères : vert dans la zone idéale, orange trop court, rouge trop long. */
export function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.trim().length
  const color = n === 0 ? "text-ink-400" : n > max ? "text-red-600" : n < min ? "text-orange-600" : "text-forest-700"
  const pct = Math.min(100, Math.round((n / max) * 100))
  const bar = n > max ? "bg-red-500" : n < min ? "bg-orange-400" : "bg-forest-700"
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
        <span className={`block h-full ${bar}`} style={{ width: `${pct}%` }} />
      </span>
      <span className={`text-xs font-semibold tabular-nums ${color}`}>
        {n}/{max}
      </span>
    </span>
  )
}

/** Aperçu du résultat dans Google. */
export function GooglePreview({ title, description, path }: { title: string; description: string; path: string }) {
  const fullTitle = `${title || "Titre de la page"} | Reyssac Bois`
  return (
    <div className="rounded border border-line bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Aperçu Google</p>
      <div className="mt-2 flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/android-chrome-192x192.png" alt="" className="h-6 w-6 rounded-full ring-1 ring-line" />
        <div className="min-w-0 leading-tight">
          <p className="text-xs text-[#202124]">Reyssac Bois</p>
          <p className="truncate text-[11px] text-[#4d5156]">https://www.reyssacbois.fr{path}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{fullTitle}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
        {description || "Ajoutez une description : c'est le petit texte affiché sous le titre dans Google."}
      </p>
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  onLabel,
  offLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  onLabel: string
  offLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-3 rounded border px-3 py-2.5 text-left transition ${
        checked ? "border-forest-700/40 bg-forest-050" : "border-orange-300 bg-orange-50"
      }`}
    >
      <span className={`text-sm font-semibold ${checked ? "text-forest-800" : "text-orange-700"}`}>
        {checked ? onLabel : offLabel}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-forest-700" : "bg-line-strong"}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
    </button>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded border border-line bg-surface text-sm transition disabled:opacity-30 ${
        danger ? "text-red-600 hover:border-red-300 hover:bg-red-50" : "text-ink-600 hover:border-forest-700/40 hover:text-forest-700"
      }`}
    >
      {children}
    </button>
  )
}

/** Carte d'un élément de liste : numéro, titre, déplacer / supprimer. */
export function ItemCard({
  index,
  total,
  label,
  onMove,
  onRemove,
  children,
}: {
  index: number
  total: number
  label: string
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded border border-line bg-surface-2/60 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-white">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <IconButton label="Monter" onClick={() => onMove(-1)} disabled={index === 0}>
            ↑
          </IconButton>
          <IconButton label="Descendre" onClick={() => onMove(1)} disabled={index === total - 1}>
            ↓
          </IconButton>
          <IconButton
            label="Supprimer"
            danger
            onClick={() => {
              if (window.confirm("Supprimer cet élément ?")) onRemove()
            }}
          >
            ✕
          </IconButton>
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded border-2 border-dashed border-line-strong px-4 py-3 text-sm font-semibold text-ink-600 transition hover:border-forest-700 hover:bg-forest-050 hover:text-forest-800"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        +
      </span>
      {label}
    </button>
  )
}

export function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[index], next[j]] = [next[j], next[index]]
  return next
}

export type FaqDraft = { id: string; question: string; answer: string }

/** Éditeur de FAQ réutilisable. */
export function FaqListEditor({ items, onChange }: { items: FaqDraft[]; onChange: (items: FaqDraft[]) => void }) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded border border-dashed border-line p-4 text-center text-sm text-ink-400">
          Aucune question pour l&apos;instant. Les FAQ apparaissent aussi dans Google.
        </p>
      ) : null}
      {items.map((item, i) => (
        <ItemCard
          key={item.id}
          index={i}
          total={items.length}
          label="Question"
          onMove={(dir) => onChange(moveItem(items, i, dir))}
          onRemove={() => onChange(items.filter((x) => x.id !== item.id))}
        >
          <input
            className={inputClass}
            placeholder="La question, telle qu'un client la poserait"
            value={item.question}
            onChange={(e) => onChange(items.map((x) => (x.id === item.id ? { ...x, question: e.target.value } : x)))}
          />
          <textarea
            className={`${inputClass} min-h-20`}
            placeholder="La réponse, courte et précise"
            value={item.answer}
            onChange={(e) => onChange(items.map((x) => (x.id === item.id ? { ...x, answer: e.target.value } : x)))}
          />
        </ItemCard>
      ))}
      <AddButton label="Ajouter une question" onClick={() => onChange([...items, { id: newClientId("faq"), question: "", answer: "" }])} />
    </div>
  )
}
