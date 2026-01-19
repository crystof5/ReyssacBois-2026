import type { Metadata } from "next"
import Breadcrumb from "@/components/Breadcrumb"
import Container from "@/components/ui/Container"
import Media from "@/components/ui/Media"
import { getSiteImage, SITE_KEYS } from "@/admin/queries/siteSettings"

export const metadata: Metadata = {
  title: "Reyssac Bois - Qui sommes-nous ?",
  description:
    "Découvrez l'histoire de Reyssac Bois, une entreprise familiale depuis 1850. Notre expertise du bois et notre engagement pour la qualité vous accompagnent dans tous vos projets.",
  openGraph: {
    title: "Reyssac Bois - Qui sommes-nous ?",
    description:
      "Découvrez l'histoire de Reyssac Bois, une entreprise familiale depuis 1850. Notre expertise du bois et notre engagement pour la qualité vous accompagnent dans tous vos projets.",
  },
}

export default async function QuiSommesNousPage() {
  const aboutHistory =
    (await getSiteImage(SITE_KEYS.aboutHistory)) ?? {
      src: "/images/caroussel/histoire.jpg",
      alt: "Histoire Reyssac Bois",
    }

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white">
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
            Qui sommes-nous ?
          </h1>
          <div className="mt-4 w-24 h-1 bg-green-600 mx-auto rounded-full" />
        </div>

        {/* Historique */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Notre Histoire
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
              L&apos;histoire débute il y a plus de 170 ans. Jean Reyssac,
              l&apos;arrière-arrière grand-père de Benoît, l&apos;actuel gérant,
              crée la société Reyssac Bois en 1850. Maraicher à l&apos;époque,
              il commercialise désormais les bois du Nord et de Pays. La
              propriété étendue jusqu&apos;au canal, permettait la livraison des
              bois par péniche en provenance de Bordeaux.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
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
        <section className="max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-bold text-gray-900">Notre Mission</h2>
          <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
            Notre mission est principalement la satisfaction du client et sa
            fidélisation. Nous favorisons des produits d&apos;origine française
            et certifiés PEFC. Du professionnel au particulier, de la baguette à
            la palette, nous oeuvrons à trouver la bonne solution à chacun de
            nos clients.
          </p>
        </section>

        {/* Localisation et projets */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
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
              Notre Localisation &amp; Projets Futurs
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
              Notre connaissance du bois transmise de générations en générations
              nous permet de conseiller, guider et accompagner chaque personne
              dans ses projets. Notre localisation est une force, aux portes
              d&apos;Agen et à mi-chemin entre Bordeaux et Toulouse, nous sommes
              au coeur du Sud-Ouest. Aujourd&apos;hui, nous sommes fiers
              d&apos;être indépendants et sommes excités pour nos futurs projets,
              notamment la rénovation de nos bâtiments historiques.
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="max-w-5xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <p className="text-gray-700 text-base sm:text-lg text-center">
            173 années d&apos;existence font de l&apos;entreprise familiale le
            plus vieux commerce d&apos;Agen. Hâte de vous recevoir dans nos
            locaux !
          </p>
        </section>
      </Container>
    </div>
  )
}


