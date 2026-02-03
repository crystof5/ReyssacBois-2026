import Link from "next/link";
import {
  getSiteImage,
  ensureHomeTexts,
  ensureSiteFontSettings,
  getSettingsVersion,
  SITE_KEYS,
} from "@/admin/queries/siteSettings";
import HautForm from "./HautForm";

export default async function AdminHomeHautPage() {
  const [hero, homeTexts, siteFont] = await Promise.all([
    getSiteImage(SITE_KEYS.homeHero),
    ensureHomeTexts(),
    ensureSiteFontSettings(),
  ]);
  const version = await getSettingsVersion([
    SITE_KEYS.homeHero,
    SITE_KEYS.homeTexts,
    SITE_KEYS.siteFont,
  ]);

  return (
    <div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Accueil — Partie haute + police
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Police du site, Hero (image), badge et mini-blocs.
            </p>

            <nav aria-label="Fil d’Ariane admin" className="mt-3">
              <ol className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/20 bg-white/65 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <li className="min-w-0">
                  <Link
                    href="/admin"
                    className="font-medium text-gray-900 hover:underline underline-offset-4"
                  >
                    Administration
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-gray-400" aria-hidden>
                    /
                  </span>
                  <Link
                    href="/admin/home"
                    className="font-medium text-gray-700 hover:underline underline-offset-4"
                  >
                    Accueil
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-gray-400" aria-hidden>
                    /
                  </span>
                  <span className="font-semibold text-gray-900">
                    Partie haute
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          <Link
            href="/admin/home"
            className="text-sm text-gray-700 hover:underline"
          >
            ← Menu Home
          </Link>
        </div>
      </div>

      <HautForm
        hero={hero ?? { src: "", alt: "" }}
        siteFont={siteFont}
        homeTexts={homeTexts}
        version={version}
      />
    </div>
  );
}
