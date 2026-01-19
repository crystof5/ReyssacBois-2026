"use client"

import { useMemo, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

function sanitizeFilename(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function ImageUploadField({
  label,
  inputName,
  initialUrl = "",
  value,
  onValueChange,
  bucket = "images",
  folder,
  helpText = "PNG/JPG/WebP. Le fichier sera uploadé dans Supabase Storage et l’URL sera enregistrée.",
}: {
  label: string
  inputName?: string
  initialUrl?: string
  value?: string
  onValueChange?: (next: string) => void
  bucket?: string
  folder: string
  helpText?: string
}) {
  const [internalUrl, setInternalUrl] = useState(initialUrl)
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const url = value !== undefined ? value : internalUrl
  const setUrl = (next: string) => {
    if (onValueChange) onValueChange(next)
    else setInternalUrl(next)
  }

  const previewUrl = useMemo(() => {
    return url?.trim() ? url.trim() : null
  }, [url])

  async function upload(file: File) {
    setStatus("uploading")
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      const safeName = sanitizeFilename(file.name || "image")
      const path = `${folder}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type || undefined,
        })

      if (uploadError) {
        setStatus("error")
        setError(uploadError.message)
        return
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = data.publicUrl

      setUrl(publicUrl)
      setStatus("idle")
    } catch {
      setStatus("error")
      setError("Upload impossible. Vérifie Supabase Storage et les policies.")
    }
  }

  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-900">
          {label}
        </span>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name={inputName}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            placeholder="https://… (rempli automatiquement après upload)"
          />

          <label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={status === "uploading"}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                void upload(file)
                // reset input
                e.currentTarget.value = ""
              }}
            />
            {status === "uploading" ? "Upload…" : "Uploader"}
          </label>
        </div>
      </label>

      {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}

      {status === "error" && error && (
        <p className="mt-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Aperçu"
            className="h-32 w-48 rounded-xl border border-gray-200 object-cover bg-white"
            onError={(e) => {
              e.currentTarget.src = "/img/placeholder.svg"
            }}
          />
        ) : (
          <div className="h-32 w-48 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500">
            Aperçu
          </div>
        )}
      </div>
    </div>
  )
}


