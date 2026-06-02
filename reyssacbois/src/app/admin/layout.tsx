import Link from "next/link";
import AdminLogoutButton from "@/admin/components/AdminLogoutButton";
import AdminSidebar from "@/admin/components/AdminSidebar";
import { requireAdmin } from "@/lib/adminAuth";
import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import AdminNavLoader from "./AdminNavLoader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Administration",
  // Sécurité SEO: empêche l’indexation de tout le back-office.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin("/admin");

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <AdminNavLoader />
      <div className="mx-auto w-full max-w-7xl">
        {/* Top bar */}
        <div className="rb-surface relative z-40 mb-6 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
                Administration
              </h1>
              <p className="mt-1 text-sm text-ink-600">
                Gestion interne (catalogue, import, contenus).
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <div className="w-full sm:w-[420px]">
                <SearchBar mode="admin" />
              </div>
              <Link href="/" className="rb-btn rb-btn-secondary whitespace-nowrap">
                Voir le site
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
        </div>

        {/* Sidebar + contenu */}
        <div className="flex flex-col gap-6 md:flex-row">
          <AdminSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
