import Link from "next/link"
import {
  getProjectsCarouselSettings,
  getSiteImage,
  SITE_KEYS,
} from "@/admin/queries/siteSettings"
import AdminSiteContentForm from "./AdminSiteContentForm"

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

      <AdminSiteContentForm
        hero={hero ?? { src: "", alt: "" }}
        family={family ?? { src: "", alt: "" }}
        aboutHistory={aboutHistory ?? { src: "", alt: "" }}
        projects={{ speed: projectsSpeed, slides: projects?.slides ?? [] }}
      />
    </div>
  )
}


