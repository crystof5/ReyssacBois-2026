import type { Metadata } from "next"
import Breadcrumb from "@/components/Breadcrumb"
import Container from "@/components/ui/Container"
import Media from "@/components/ui/Media"
import { getAboutTexts, getSiteImage, SITE_KEYS } from "@/admin/queries/siteSettings"

export const metadata: Metadata = {
  title: "Qui sommes-nous ?",
  description:
    "Découvrez l'histoire de Reyssac Bois, une entreprise familiale depuis 1850. Notre expertise du bois et notre engagement pour la qualité vous accompagnent dans tous vos projets.",
  alternates: { canonical: "/qui-sommes-nous" },
  openGraph: {
    title: "Qui sommes-nous ?",
    description:
      "Découvrez l'histoire de Reyssac Bois, une entreprise familiale depuis 1850. Notre expertise du bois et notre engagement pour la qualité vous accompagnent dans tous vos projets.",
    url: "/qui-sommes-nous",
  },
}

export default async function QuiSommesNousPage() {
  const aboutTexts = await getAboutTexts()
  const aboutHistory =
    (await getSiteImage(SITE_KEYS.aboutHistory)) ?? {
      // Fallback: asset existant dans /public pour éviter des 404 si setting absent.
      src: "/img/placeholder.svg",
      alt: "Histoire Reyssac Bois",
    }

  const pageTitle = aboutTexts?.pageTitle?.trim() ? aboutTexts.pageTitle.trim() : "Qui sommes-nous ?"
  const historyTitle = aboutTexts?.historyTitle?.trim() ? aboutTexts.historyTitle.trim() : "Notre Histoire"
  const historyText =
    aboutTexts?.historyText?.trim()
      ? aboutTexts.historyText.trim()
      : "L'histoire débute il y a plus de 170 ans. Jean Reyssac, l'arrière-arrière grand-père de Benoît, l'actuel gérant, crée la société Reyssac Bois en 1850. Maraicher à l'époque, il commercialise désormais les bois du Nord et de Pays. La propriété étendue jusqu'au canal, permettait la livraison des bois par péniche en provenance de Bordeaux."
  const missionTitle = aboutTexts?.missionTitle?.trim() ? aboutTexts.missionTitle.trim() : "Notre Mission"
  const missionText =
    aboutTexts?.missionText?.trim()
      ? aboutTexts.missionText.trim()
      : "Notre mission est principalement la satisfaction du client et sa fidélisation. Nous favorisons des produits d'origine française et certifiés PEFC. Du professionnel au particulier, de la baguette à la palette, nous oeuvrons à trouver la bonne solution à chacun de nos clients."
  const locationTitle =
    aboutTexts?.locationTitle?.trim()
      ? aboutTexts.locationTitle.trim()
      : "Notre Localisation & Projets Futurs"
  const locationText =
    aboutTexts?.locationText?.trim()
      ? aboutTexts.locationText.trim()
      : "Notre connaissance du bois transmise de générations en générations nous permet de conseiller, guider et accompagner chaque personne dans ses projets. Notre localisation est une force, aux portes d'Agen et à mi-chemin entre Bordeaux et Toulouse, nous sommes au coeur du Sud-Ouest. Aujourd'hui, nous sommes fiers d'être indépendants et sommes excités pour nos futurs projets, notamment la rénovation de nos bâtiments historiques."
  const conclusionText =
    aboutTexts?.conclusionText?.trim()
      ? aboutTexts.conclusionText.trim()
      : "173 années d'existence font de l'entreprise familiale le plus vieux commerce d'Agen. Hâte de vous recevoir dans nos locaux !"

  return (
    <div className="bg-gradient-to-b from-amber-50/60 to-white/20">
      <Container className="py-10 sm:py-14 space-y-10">
        <Breadcrumb
          items={[
            {
              id: "qui-sommes-nous",
              name: "Qui sommes-nous ?",
              href: "/qui-sommes-nous",
            },
          ]}
        />

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            {pageTitle}
          </h1>
          <div className="mt-4 w-24 h-1 bg-green-600 mx-auto rounded-full" />
        </div>

        {/* Historique */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {historyTitle}
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
              {historyText}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/50 backdrop-blur">
            <div className="aspect-[4/3] w-full">
              <Media
                src={aboutHistory.src}
                alt={aboutHistory.alt}
                className="h-full w-full"
              />
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-5xl mx-auto rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-bold text-gray-900">{missionTitle}</h2>
          <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
            {missionText}
          </p>
        </section>

        {/* Localisation et projets */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur p-6 shadow-sm hover:shadow-md transition">
          <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/50 backdrop-blur">
            <div className="relative w-full pt-[56.25%]">
              <iframe
                title="Carte - Reyssac Bois"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2861.0054045604797!2d0.6584004767006642!3d44.186355417784526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12abb381555554cf%3A0xa1fac795a72fef80!2sReyssac%20Bois!5e0!3m2!1sfr!2sfr!4v1693635316155!5m2!1sfr!2sfr"
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {locationTitle}
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
              {locationText}
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="max-w-5xl mx-auto rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur p-6 shadow-sm hover:shadow-md transition">
          <p className="text-gray-700 text-base sm:text-lg text-center">
            {conclusionText}
          </p>
        </section>
      </Container>
    </div>
  )
}


