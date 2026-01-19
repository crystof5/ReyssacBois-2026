"use client"

import { useState } from "react"

export default function SlugField({
  label = "Slug",
  name = "slug",
  defaultValue,
  helpText = "Par défaut, le slug est figé. Clique sur “Modifier” pour le changer.",
}: {
  label?: string
  name?: string
  defaultValue: string
  helpText?: string
}) {
  const [editing, setEditing] = useState(false)

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-900">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <input
          name={editing ? name : undefined}
          defaultValue={defaultValue}
          disabled={!editing}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20 disabled:bg-gray-50 disabled:text-gray-600"
        />
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {editing ? "Verrouiller" : "Modifier"}
        </button>
      </div>

      {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}
    </label>
  )
}


