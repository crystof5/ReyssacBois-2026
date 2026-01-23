"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
    >
      <path
        d="M12 3a9 9 0 1 0 9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function AdminStickySaveBar({
  hint = "Pense à enregistrer tes modifications.",
  secondaryHref,
  secondaryLabel,
}: {
  hint?: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  const { pending } = useFormStatus()

  return (
    <div className="sticky bottom-4 z-10">
      <div className="rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl p-3 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-xs text-gray-700">
          {hint}
          {pending ? (
            <span className="ml-2 inline-flex items-center gap-2 font-medium text-gray-900">
              <Spinner className="h-4 w-4 animate-spin" /> Enregistrement…
            </span>
          ) : null}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white"
            >
              {secondaryLabel}
            </Link>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:opacity-60"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4 animate-spin" />
                Enregistrement…
              </span>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

