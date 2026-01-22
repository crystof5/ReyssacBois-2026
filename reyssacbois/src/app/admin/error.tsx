"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Utile en dev/prod pour diagnostiquer l'origine.
    // eslint-disable-next-line no-console
    console.error("Admin route error:", error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <h2 className="text-lg font-semibold text-gray-900">
          Oups… une erreur est survenue
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Ça peut arriver si la base de données redémarre ou si la page a été mise
          à jour pendant que tu étais dessus.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          >
            Réessayer
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Retour à l’administration
          </Link>
          <Link
            href="/admin/produits"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Liste des produits
          </Link>
        </div>

        {error?.digest ? (
          <p className="mt-5 text-xs text-gray-500">Code: {error.digest}</p>
        ) : null}
      </div>
    </div>
  )
}

