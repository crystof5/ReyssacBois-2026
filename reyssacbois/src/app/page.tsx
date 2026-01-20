import Link from "next/link"
import Media from "@/components/ui/Media"
import ProjectsCarousel from "@/components/ProjectsCarousel"
import {
  getHomeTexts,
  getProjectsCarouselSettings,
  getSiteImage,
  SITE_KEYS,
} from "@/admin/queries/siteSettings"

export default async function Home() {
  const [hero, family, projects, homeTexts] = await Promise.all([
    getSiteImage(SITE_KEYS.homeHero),
    getSiteImage(SITE_KEYS.homeFamily),
    getProjectsCarouselSettings(),
    getHomeTexts(),
  ])

  // Fallbacks: utiliser un asset existant dans /public pour éviter des 404 si les settings ne sont pas encore remplis.
  const heroImage = hero ?? { src: "/img/placeholder.svg", alt: "Reyssac Bois" }
  const familyImage = family ?? { src: "/img/placeholder.svg", alt: "Reyssac Bois" }
  const heroTitle = homeTexts?.heroTitle?.trim() ? homeTexts.heroTitle.trim() : "Reyssac Bois"
  const heroSubtitle = homeTexts?.heroSubtitle?.trim() ? homeTexts.heroSubtitle.trim() : "Votre expert en bois depuis 1850"
  const familyTitle = homeTexts?.familyTitle?.trim() ? homeTexts.familyTitle.trim() : "Une histoire de famille"
  const familyP1 =
    homeTexts?.familyP1?.trim()
      ? homeTexts.familyP1.trim()
      : "Implantée à Boé et Bon-Encontre, proche d'Agen, l'entreprise Reyssac Bois a vu le jour en 1850. Depuis, notre passion et notre expertise du bois se sont transmises de père en fils sur cinq générations."
  const familyP2 =
    homeTexts?.familyP2?.trim()
      ? homeTexts.familyP2.trim()
      : "Nos équipes sont prêtes à accueillir aussi bien les professionnels que les particuliers. Avec un stock important à disposition, nous nous efforçons de répondre à chaque demande avec précision."
  const projectsSlides =
    projects?.slides?.length
      ? projects.slides
      : [
          { src: "/img/placeholder.svg", alt: "Projet 1" },
          { src: "/img/placeholder.svg", alt: "Projet 2" },
          { src: "/img/placeholder.svg", alt: "Projet 3" },
        ]
  const projectsIntervalMs = projects?.intervalMs ?? 5000

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <div className="absolute inset-0">
          <Media src={heroImage.src} alt={heroImage.alt} className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10 flex items-center justify-center text-center">
          <div className="mx-auto w-full max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 transition-transform duration-700 hover:scale-[1.02]">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8">
              {heroSubtitle}
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-medium text-green-800 shadow-lg transition hover:bg-green-50"
            >
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </section>

      {/* PRÉSENTATION */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full">
                <Media src={familyImage.src} alt={familyImage.alt} className="h-full w-full" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 sm:-bottom-5 sm:-right-5 bg-green-700 text-white px-4 py-3 sm:p-4 rounded-2xl shadow-lg">
              <p className="text-xl sm:text-2xl font-bold leading-none">Depuis 1850</p>
              <p className="text-xs mt-1 text-white/90">Entreprise familiale</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {familyTitle}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {familyP1}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              {familyP2}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <Badge>Expertise professionnelle</Badge>
              <Badge>Stock important</Badge>
              <Badge>Service personnalisé</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                Nous contacter
              </Link>
              <Link
                href="/produits"
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600/20"
              >
                Voir les catégories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROJETS (slider simple) */}
      <section className="bg-white py-14 sm:py-20 border-y border-gray-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Nos Projets
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full" />
          </div>

          <ProjectsCarousel slides={projectsSlides} intervalMs={projectsIntervalMs} />
        </div>
      </section>

      {/* PRODUITS (teasers) */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Découvrez nos produits
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TeaserCard title="Bois de construction" desc="Des matériaux de qualité pour vos projets de construction." />
          <TeaserCard title="Menuiserie" desc="Des solutions personnalisées pour vos aménagements." />
          <TeaserCard title="Rénovation" desc="Tout pour vos projets de rénovation et décoration." />
        </div>

        <div className="text-center mt-10">
          <Link
            href="/produits"
            className="inline-flex items-center justify-center rounded-full bg-green-700 text-white px-8 py-3 font-medium hover:bg-green-800 transition shadow-lg"
          >
            Voir tous nos produits
          </Link>
        </div>
      </section>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
      {children}
    </span>
  )
}

function TeaserCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-800 font-bold">
        ✦
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  )
}
