"use client"

import { useMemo, useState } from "react"
import ImageUploadField from "./ImageUploadField"

export type EditableSlide = { src: string; alt: string }

export default function ProjectsCarouselEditor({
  initialSlides,
  initialSpeed,
}: {
  initialSlides: EditableSlide[]
  initialSpeed: "slow" | "normal" | "fast"
}) {
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">(initialSpeed)
  const [items, setItems] = useState<EditableSlide[]>(
    initialSlides.length ? initialSlides : [{ src: "", alt: "" }]
  )

  const slidesJson = useMemo(() => JSON.stringify(items), [items])
  const addPhoto = () => setItems((arr) => [...arr, { src: "", alt: "" }])

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-900">
          Vitesse du carrousel “Nos Projets”
        </span>
        <select
          name="projectsSpeed"
          value={speed}
          onChange={(e) => setSpeed(e.target.value as "slow" | "normal" | "fast")}
          className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
        >
          <option value="slow">Lent</option>
          <option value="normal">Normal</option>
          <option value="fast">Rapide</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">Lent = 8s, Normal = 5s, Rapide = 3s.</p>
      </label>

      <input type="hidden" name="projectsSlidesJson" value={slidesJson} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Photos projets ({items.filter((s) => s.src.trim()).length})
        </h3>
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          onClick={addPhoto}
        >
          + Ajouter une photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-900">Projet {idx + 1}</h4>
              <button
                type="button"
                className="text-sm text-red-700 hover:underline"
                onClick={() =>
                  setItems((arr) => (arr.length <= 1 ? arr : arr.filter((_, i) => i !== idx)))
                }
              >
                Supprimer
              </button>
            </div>

            <div className="mt-3">
              <ImageUploadField
                label="Image"
                folder="home/projects"
                helpText=""
                value={it.src}
                onValueChange={(next) =>
                  setItems((arr) => arr.map((s, i) => (i === idx ? { ...s, src: next } : s)))
                }
              />
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-gray-900">
                Texte alternatif
              </span>
              <input
                value={it.alt}
                onChange={(e) =>
                  setItems((arr) => arr.map((s, i) => (i === idx ? { ...s, alt: e.target.value } : s)))
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder={`Projet ${idx + 1}`}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Astuce: tu peux ajouter autant de photos que tu veux (on garde un garde-fou à 50 en base).
        </p>
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          onClick={addPhoto}
        >
          + Ajouter une photo
        </button>
      </div>
    </div>
  )
}


