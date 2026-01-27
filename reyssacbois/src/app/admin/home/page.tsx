import Link from "next/link"
import {
  getConstructionBannerSettings,
  ensureHomeFaqSettings,
  getProjectsCarouselSettings,
  getPromoModalSettings,
  getSiteImage,
  ensureAboutTexts,
  ensureHomeTexts,
  ensureSiteFontSettings,
  SITE_KEYS,
} from "@/admin/queries/siteSettings"
import AdminSiteContentForm from "./AdminSiteContentForm"

export default async function AdminHomePage() {
  const [hero, family, aboutHistory, projects, homeTexts, aboutTexts, faq, banner, promo, siteFont] = await Promise.all([
    getSiteImage(SITE_KEYS.homeHero),
    getSiteImage(SITE_KEYS.homeFamily),
    getSiteImage(SITE_KEYS.aboutHistory),
    getProjectsCarouselSettings(),
    ensureHomeTexts(),
    ensureAboutTexts(),
    ensureHomeFaqSettings(),
    getConstructionBannerSettings(),
    getPromoModalSettings(),
    ensureSiteFontSettings(),
  ])

  const projectsSpeed: "slow" | "normal" | "fast" =
    projects?.intervalMs === 8000 ? "slow" : projects?.intervalMs === 3000 ? "fast" : "normal"

  return (
    <div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Contenu du site</h2>
            <p className="mt-1 text-sm text-gray-700">
              Images, textes, promo, et bannière “site en construction”.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-gray-700 hover:underline">
            ← Dashboard
          </Link>
        </div>
      </div>

      <AdminSiteContentForm
        hero={hero ?? { src: "", alt: "" }}
        family={family ?? { src: "", alt: "" }}
        aboutHistory={aboutHistory ?? { src: "", alt: "" }}
        projects={{ speed: projectsSpeed, slides: projects?.slides ?? [] }}
        homeTexts={homeTexts}
        aboutTexts={aboutTexts}
        homeFaq={faq}
        banner={banner ?? { isVisible: false, text: "", textHtml: "" }}
        siteFont={siteFont}
        promo={
          promo
            ? { ...promo, image: promo.image ?? { src: "", alt: "" } }
            : { isVisible: false, title: "", text: "", textHtml: "", image: { src: "", alt: "" } }
        }
      />
    </div>
  )
}


