import Link from "next/link";
import { getProjectsCarouselSettings, getSettingsVersion, SITE_KEYS } from "@/admin/queries/siteSettings";
import ProjetsForm from "./ProjetsForm";

export default async function AdminHomeProjetsPage() {
  const projects = await getProjectsCarouselSettings();
  const version = await getSettingsVersion([SITE_KEYS.homeProjects]);
  const projectsSpeed: "slow" | "normal" | "fast" =
    projects?.intervalMs === 8000
      ? "slow"
      : projects?.intervalMs === 3000
      ? "fast"
      : "normal";

  return (
    <div>
      <div className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Accueil — Projets
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Carrousel “Nos projets”.
            </p>

            <nav aria-label="Fil d’Ariane admin" className="mt-3">
              <ol className="inline-flex max-w-full flex-wrap items-center gap-2 border-b border-line pb-2 text-xs text-ink-600">
                <li className="min-w-0">
                  <Link
                    href="/admin"
                    className="font-medium text-ink hover:underline underline-offset-4"
                  >
                    Administration
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-line-strong" aria-hidden>
                    /
                  </span>
                  <Link
                    href="/admin/home"
                    className="font-medium text-ink-600 hover:underline underline-offset-4"
                  >
                    Accueil
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-line-strong" aria-hidden>
                    /
                  </span>
                  <span className="font-semibold text-ink">Projets</span>
                </li>
              </ol>
            </nav>
          </div>

          <Link
            href="/admin/home"
            className="text-sm text-ink-600 hover:underline"
          >
            ← Menu Home
          </Link>
        </div>
      </div>

      <ProjetsForm
        initial={{ speed: projectsSpeed, slides: projects?.slides ?? [] }}
        version={version}
      />
    </div>
  );
}
