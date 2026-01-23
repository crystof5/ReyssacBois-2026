"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import ImageUploadField from "@/admin/components/ImageUploadField"
import ProjectsCarouselEditor from "@/admin/components/ProjectsCarouselEditor"
import { updateSiteContentAction } from "@/admin/actions/siteContent"
import PromoModal from "@/components/PromoModal"
import RichTextEditor from "@/admin/components/RichTextEditor"
import { DEFAULT_SITE_FONT_KEY, getFontFamilyStackForKey, isSiteFontKey, SITE_FONTS, type SiteFontKey } from "@/lib/siteFonts"

type SiteImage = { src: string; alt: string }
type HomeTexts = {
  heroTitle: string
  heroSubtitle: string
  familyTitle: string
  familyP1: string
  familyP2: string
  familyP1Html?: string
  familyP2Html?: string
}
type AboutTexts = {
  pageTitle: string
  historyTitle: string
  historyText: string
  missionTitle: string
  missionText: string
  locationTitle: string
  locationText: string
  conclusionText: string
  historyTextHtml?: string
  missionTextHtml?: string
  locationTextHtml?: string
  conclusionTextHtml?: string
}

export default function AdminSiteContentForm({
  hero,
  family,
  aboutHistory,
  projects,
  homeTexts,
  aboutTexts,
  banner,
  siteFont,
  promo,
}: {
  hero: SiteImage
  family: SiteImage
  aboutHistory: SiteImage
  projects: { speed: "slow" | "normal" | "fast"; slides: Array<{ src: string; alt: string }> }
  homeTexts: HomeTexts
  aboutTexts: AboutTexts
  banner: { isVisible: boolean; text: string; textHtml?: string }
  siteFont: { key: string }
  promo: { isVisible: boolean; title: string; text: string; textHtml?: string; image: SiteImage }
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateSiteContentAction, null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [promoPreview, setPromoPreview] = useState<{
    title: string
    textHtml: string
    image: { src: string; alt: string } | null
  } | null>(null)
  const [promoPreviewNonce, setPromoPreviewNonce] = useState(0)

  const initialFontKey: SiteFontKey = isSiteFontKey(siteFont?.key) ? siteFont.key : DEFAULT_SITE_FONT_KEY
  const [fontPreviewKey, setFontPreviewKey] = useState<SiteFontKey>(initialFontKey)

  useEffect(() => {
    if (state?.ok) {
      // Recharge les données serveur (au cas où)
      router.refresh()
    }
  }, [router, state?.ok])

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-10">
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
        <h3 className="text-sm font-semibold text-gray-900">Identité visuelle — Police du site</h3>
        <p className="mt-1 text-xs text-gray-500">
          La prévisualisation ci-dessous ne modifie rien côté clients. La police est appliquée au site seulement après
          <span className="font-medium"> Enregistrer</span>.
        </p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Police</span>
            <select
              name="siteFontKey"
              value={fontPreviewKey}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              onChange={(e) => {
                const v = e.currentTarget.value
                setFontPreviewKey(isSiteFontKey(v) ? v : DEFAULT_SITE_FONT_KEY)
              }}
            >
              {SITE_FONTS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-gray-200 bg-[rgba(246,241,231,0.55)] p-4">
            <p className="text-xs text-gray-500">Aperçu</p>
            <div
              className="mt-2 rounded-lg border border-gray-200 bg-white p-4"
              style={{ fontFamily: getFontFamilyStackForKey(fontPreviewKey) }}
            >
              <p className="text-sm font-semibold text-gray-900">Reyssac Bois</p>
              <p className="mt-1 text-sm text-gray-700">
                Bois de construction, menuiserie et quincaillerie. Ce texte simule un contenu “en dur” ou venant de la DB.
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Bouton d’exemple
              </button>
            </div>
          </div>
        </div>
      </section>

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
          </label>
          <RichTextEditor
            inputName="homeFamilyP1Html"
            initialHtml={homeTexts.familyP1Html ?? homeTexts.familyP1 ?? ""}
            placeholder="Texte…"
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Paragraphe 2</span>
          </label>
          <RichTextEditor
            inputName="homeFamilyP2Html"
            initialHtml={homeTexts.familyP2Html ?? homeTexts.familyP2 ?? ""}
            placeholder="Texte…"
          />
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
          </label>
          <RichTextEditor
            inputName="aboutHistoryTextHtml"
            initialHtml={aboutTexts.historyTextHtml ?? aboutTexts.historyText ?? ""}
            placeholder="Texte…"
          />
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
          </label>
          <RichTextEditor
            inputName="aboutMissionTextHtml"
            initialHtml={aboutTexts.missionTextHtml ?? aboutTexts.missionText ?? ""}
            placeholder="Texte…"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte “Localisation & Projets Futurs”</span>
          </label>
          <RichTextEditor
            inputName="aboutLocationTextHtml"
            initialHtml={aboutTexts.locationTextHtml ?? aboutTexts.locationText ?? ""}
            placeholder="Texte…"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte de conclusion</span>
          </label>
          <RichTextEditor
            inputName="aboutConclusionTextHtml"
            initialHtml={aboutTexts.conclusionTextHtml ?? aboutTexts.conclusionText ?? ""}
            placeholder="Texte…"
          />
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
          </label>
        </div>

        <div className="mt-4">
          <RichTextEditor
            inputName="bannerTextHtml"
            initialHtml={banner.textHtml ?? banner.text ?? ""}
            placeholder="Site en construction — certaines informations peuvent évoluer."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Promo / Événement — Modale</h3>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Astuce: utilise l’aperçu pour tester la modale sans la rendre visible aux clients.
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => {
              const form = formRef.current
              if (!form) return
              const title =
                (form.elements.namedItem("promoTitle") as HTMLInputElement | null)?.value ?? ""
              const textHtml =
                (form.elements.namedItem("promoTextHtml") as HTMLInputElement | null)?.value ?? ""
              const src =
                (form.elements.namedItem("promoImageSrc") as HTMLInputElement | null)?.value ?? ""
              const alt =
                (form.elements.namedItem("promoImageAlt") as HTMLInputElement | null)?.value ?? ""

              setPromoPreview({
                title,
                textHtml,
                image: src.trim() ? { src, alt } : null,
              })
              setPromoPreviewNonce((n) => n + 1)
            }}
          >
            Tester (aperçu admin)
          </button>
        </div>
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
            <p className="mt-2 text-xs text-gray-500">
              Utilise la barre d’outils pour mettre en forme (gras, souligné, italique, couleur, liens).
            </p>
          </label>
        </div>

        <div className="mt-4">
          <RichTextEditor
            inputName="promoTextHtml"
            initialHtml={promo.textHtml ?? promo.text ?? ""}
            placeholder="Détails de l’offre / de l’événement…"
            helperText="Conseil: ajoute un lien (bouton “Lien”) pour activer le bouton CTA “En profiter”."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image promo"
            inputName="promoImageSrc"
            initialUrl={promo.image.src}
            folder="promo"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Légende (texte alternatif)
            </span>
            <input
              name="promoImageAlt"
              defaultValue={promo.image.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Photo promo"
            />
            <p className="mt-2 text-xs text-gray-500">
              Affiché sous l’image dans la modale (et utilisé aussi pour l’accessibilité si l’image ne charge pas).
            </p>
          </label>
        </div>
      </section>

      {promoPreview ? (
        <PromoModal
          key={promoPreviewNonce}
          mode="adminPreview"
          onRequestClose={() => setPromoPreview(null)}
          promo={{
            isVisible: true,
            title: promoPreview.title,
            text: "",
            textHtml: promoPreview.textHtml,
            image: promoPreview.image,
          }}
        />
      ) : null}

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

