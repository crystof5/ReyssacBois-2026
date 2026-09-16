"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { slugify } from "@/lib/slugify"

export default function SlugField({
  label = "Slug",
  name = "slug",
  defaultValue,
  sourceFieldName = "name",
  helpText = "Automatique: le slug se met à jour quand tu modifies le nom.",
}: {
  label?: string
  name?: string
  defaultValue: string
  sourceFieldName?: string
  helpText?: string
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const initialNameRef = useRef<string | null>(null)
  const [slug, setSlug] = useState(defaultValue)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const form = root.closest("form")
    if (!form) return
    const nameInput = form.querySelector<HTMLInputElement>(`input[name="${sourceFieldName}"]`)
    if (!nameInput) return

    if (initialNameRef.current === null) {
      initialNameRef.current = nameInput.value ?? ""
    }

    const onInput = () => {
      const initialName = initialNameRef.current ?? ""
      const currentName = nameInput.value ?? ""
      // Tant que le nom n'a pas changé, on conserve le slug existant.
      if (currentName.trim() === initialName.trim()) {
        setSlug(defaultValue)
        return
      }
      const next = slugify(currentName)
      setSlug(next)
    }

    nameInput.addEventListener("input", onInput)
    return () => nameInput.removeEventListener("input", onInput)
  }, [defaultValue, sourceFieldName])

  const pretty = useMemo(() => {
    return slug || "—"
  }, [slug])

  return (
    <div ref={rootRef} className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>

      {/* Valeur réellement envoyée au serveur (dédupliquée côté serveur) */}
      <input type="hidden" name={name} value={slug} />

      <div className="flex items-center gap-2">
        <input
          value={pretty}
          readOnly
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink-600"
        />
        <span className="shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink-600">
          Auto
        </span>
      </div>

      {helpText && <p className="mt-2 text-xs text-ink-400">{helpText}</p>}
    </div>
  )
}


