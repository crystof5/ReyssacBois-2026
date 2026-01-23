import Link from "next/link"
import AdminLogoutButton from "@/admin/components/AdminLogoutButton"
import { requireAdmin } from "@/lib/adminAuth"
import type { Metadata } from "next"
import SearchBar from "@/components/SearchBar"

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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative z-50 mb-6 rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="mt-1 text-sm text-gray-700">
                Gestion interne (catalogue, import, contenus).
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <div className="w-full sm:w-[420px]">
                <SearchBar mode="admin" />
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/60 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-white/75 backdrop-blur"
              >
                Voir le site
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}


