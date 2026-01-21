import Link from "next/link"
import AdminLogoutButton from "@/admin/components/AdminLogoutButton"
import { requireAdmin } from "@/lib/adminAuth"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Administration",
  // Sécurité SEO: empêche l’indexation de tout le back-office.
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin("/admin")

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestion interne (catalogue, import, contenus).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Voir le site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
          {children}
        </div>
      </div>
    </div>
  )
}


