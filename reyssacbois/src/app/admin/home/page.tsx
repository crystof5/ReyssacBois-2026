import Link from "next/link"
import {
  getProjectsCarouselSettings,
  getSiteImage,
  SITE_KEYS,
} from "@/admin/queries/siteSettings"
import { updateSiteContentAction } from "@/admin/actions/siteContent"
import ImageUploadField from "@/admin/components/ImageUploadField"
import ProjectsCarouselEditor from "@/admin/components/ProjectsCarouselEditor"

export default async function AdminHomePage() {
  const [hero, family, aboutHistory, projects] = await Promise.all([
    getSiteImage(SITE_KEYS.homeHero),
    getSiteImage(SITE_KEYS.homeFamily),
    getSiteImage(SITE_KEYS.aboutHistory),
    getProjectsCarouselSettings(),
  ])

  const projectsSpeed: "slow" | "normal" | "fast" =
    projects?.intervalMs === 8000 ? "slow" : projects?.intervalMs === 3000 ? "fast" : "normal"

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Contenu du site
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Images de la home, carrousel “Nos Projets”, et photo “Notre Histoire”.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-gray-700 hover:underline">
          ← Dashboard
        </Link>
      </div>

      <form action={updateSiteContentAction} className="mt-6 space-y-10">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">Home — Hero (1 photo)</h3>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageUploadField
              label="Image hero"
              inputName="heroSrc"
              initialUrl={hero?.src ?? ""}
              folder="home/hero"
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
              <input
                name="heroAlt"
                defaultValue={hero?.alt ?? ""}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="Atelier Reyssac Bois"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">Home — “Une histoire de famille”</h3>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageUploadField
              label="Image"
              inputName="familySrc"
              initialUrl={family?.src ?? ""}
              folder="home/family"
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
              <input
                name="familyAlt"
                defaultValue={family?.alt ?? ""}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="Reyssac Bois"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">Home — Nos Projets (carrousel)</h3>
          <div className="mt-4">
            <ProjectsCarouselEditor
              initialSpeed={projectsSpeed}
              initialSlides={projects?.slides ?? []}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">Qui sommes-nous — “Notre Histoire”</h3>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageUploadField
              label="Image"
              inputName="aboutHistorySrc"
              initialUrl={aboutHistory?.src ?? ""}
              folder="about/history"
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
              <input
                name="aboutHistoryAlt"
                defaultValue={aboutHistory?.alt ?? ""}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="Histoire Reyssac Bois"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          >
            Enregistrer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Voir la home
          </Link>
        </div>
      </form>
    </div>
  )
}


