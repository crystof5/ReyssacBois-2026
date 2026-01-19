"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ImageUploadField from "@/admin/components/ImageUploadField"
import ProjectsCarouselEditor from "@/admin/components/ProjectsCarouselEditor"
import { updateSiteContentAction } from "@/admin/actions/siteContent"

type SiteImage = { src: string; alt: string }
type HomeTexts = { heroTitle: string; heroSubtitle: string; familyTitle: string; familyP1: string; familyP2: string }
type AboutTexts = {
  pageTitle: string
  historyTitle: string
  historyText: string
  missionTitle: string
  missionText: string
  locationTitle: string
  locationText: string
  conclusionText: string
}

export default function AdminSiteContentForm({
  hero,
  family,
  aboutHistory,
  projects,
  homeTexts,
  aboutTexts,
  banner,
  promo,
}: {
  hero: SiteImage
  family: SiteImage
  aboutHistory: SiteImage
  projects: { speed: "slow" | "normal" | "fast"; slides: Array<{ src: string; alt: string }> }
  homeTexts: HomeTexts
  aboutTexts: AboutTexts
  banner: { isVisible: boolean; text: string }
  promo: { isVisible: boolean; title: string; text: string; image: SiteImage }
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateSiteContentAction, null)

  useEffect(() => {
    if (state?.ok) {
      // Recharge les données serveur (au cas où)
      router.refresh()
    }
  }, [router, state?.ok])

  return (
    <form action={formAction} className="mt-6 space-y-10">
      {state?.message && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.ok
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Home — Hero (1 photo)</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image hero"
            inputName="heroSrc"
            initialUrl={hero.src}
            folder="home/hero"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="heroAlt"
              defaultValue={hero.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Atelier Reyssac Bois"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Titre</span>
            <input
              name="homeHeroTitle"
              defaultValue={homeTexts.heroTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Reyssac Bois"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Sous-titre</span>
            <input
              name="homeHeroSubtitle"
              defaultValue={homeTexts.heroSubtitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Votre expert en bois depuis 1850"
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
            initialUrl={family.src}
            folder="home/family"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="familyAlt"
              defaultValue={family.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Reyssac Bois"
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Titre</span>
            <input
              name="homeFamilyTitle"
              defaultValue={homeTexts.familyTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Une histoire de famille"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Paragraphe 1</span>
            <textarea
              name="homeFamilyP1"
              defaultValue={homeTexts.familyP1}
              className="min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Texte..."
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Paragraphe 2</span>
            <textarea
              name="homeFamilyP2"
              defaultValue={homeTexts.familyP2}
              className="min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Texte..."
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Home — Nos Projets (carrousel)</h3>
        <div className="mt-4">
          <ProjectsCarouselEditor initialSpeed={projects.speed} initialSlides={projects.slides} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Qui sommes-nous — “Notre Histoire”</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image"
            inputName="aboutHistorySrc"
            initialUrl={aboutHistory.src}
            folder="about/history"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="aboutHistoryAlt"
              defaultValue={aboutHistory.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Histoire Reyssac Bois"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Qui sommes-nous — Textes</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Titre de page</span>
            <input
              name="aboutPageTitle"
              defaultValue={aboutTexts.pageTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Qui sommes-nous ?"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Titre “Notre Histoire”</span>
            <input
              name="aboutHistoryTitle"
              defaultValue={aboutTexts.historyTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Notre Histoire"
            />
          </label>
        </div>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte “Notre Histoire”</span>
            <textarea
              name="aboutHistoryText"
              defaultValue={aboutTexts.historyText}
              className="min-h-28 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">Titre “Notre Mission”</span>
              <input
                name="aboutMissionTitle"
                defaultValue={aboutTexts.missionTitle}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="Notre Mission"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">Titre “Localisation & Projets Futurs”</span>
              <input
                name="aboutLocationTitle"
                defaultValue={aboutTexts.locationTitle}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="Notre Localisation & Projets Futurs"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte “Notre Mission”</span>
            <textarea
              name="aboutMissionText"
              defaultValue={aboutTexts.missionText}
              className="min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte “Localisation & Projets Futurs”</span>
            <textarea
              name="aboutLocationText"
              defaultValue={aboutTexts.locationText}
              className="min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte de conclusion</span>
            <textarea
              name="aboutConclusionText"
              defaultValue={aboutTexts.conclusionText}
              className="min-h-20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Bannière — “Site en construction”</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Visible</span>
            <select
              name="bannerVisible"
              defaultValue={banner.isVisible ? "1" : "0"}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="0">Cachée</option>
              <option value="1">Visible</option>
            </select>
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte</span>
            <textarea
              name="bannerText"
              defaultValue={banner.text}
              className="min-h-20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Site en construction — certaines informations peuvent évoluer."
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Promo / Événement — Modale</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Visible</span>
            <select
              name="promoVisible"
              defaultValue={promo.isVisible ? "1" : "0"}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="0">Cachée</option>
              <option value="1">Visible</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Titre</span>
            <input
              name="promoTitle"
              defaultValue={promo.title}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Promo / événement"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte</span>
            <textarea
              name="promoText"
              defaultValue={promo.text}
              className="min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Détails de l’offre / de l’événement..."
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image promo"
            inputName="promoImageSrc"
            initialUrl={promo.image.src}
            folder="promo"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="promoImageAlt"
              defaultValue={promo.image.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Photo promo"
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-3 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">
            Pense à cliquer <span className="font-medium">Enregistrer</span> après tes modifications.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:opacity-60"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  )
}

