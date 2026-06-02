"use client"

import { useState, type ReactNode } from "react"

export type AdminTab = { id: string; label: string; content: ReactNode }

/**
 * Onglets pour découper une longue page d'édition en sections.
 * IMPORTANT : tous les panneaux restent montés dans le DOM (masqués via `hidden`),
 * donc tous les champs sont bien soumis avec le `<form>` parent — aucun binding cassé.
 * Les boutons sont `type="button"` pour ne pas déclencher la soumission.
 */
export default function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "")

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => {
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:rb-focus ${
                isActive
                  ? "border-forest-700 text-forest-700"
                  : "border-transparent text-ink-600 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        {tabs.map((t) => (
          <div key={t.id} role="tabpanel" className={t.id === active ? "" : "hidden"}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  )
}
