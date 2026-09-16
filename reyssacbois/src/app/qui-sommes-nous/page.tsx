import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import Media from "@/components/ui/Media"
import RichText from "@/components/ui/RichText"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import LocalSeoBand from "@/components/LocalSeoBand"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import { getAboutTexts, getSiteImage, SITE_KEYS } from "@/admin/queries/siteSettings"
import { BUSINESS } from "@/lib/business"
import { absoluteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Qui sommes-nous – Négoce de bois familial à Agen depuis 1850",
  description:
    "Reyssac Bois, entreprise familiale depuis 1850 à Boé près d'Agen : de la scierie au négoce de bois, cinq générations au service des particuliers et des pros.",
  alternates: { canonical: "/qui-sommes-nous" },
  openGraph: { title: "Reyssac Bois, négoce de bois familial depuis 1850", url: "/qui-sommes-nous" },
}

// Faits repris de l'historique publié sur le site (section "Une histoire de famille").
const TIMELINE = [
  {
    year: "1850",
    title: "La fondation",
    text: "Jean Reyssac, maraîcher, commence à commercialiser les bois du Nord et de pays. Les bois arrivent par péniche depuis Bordeaux grâce au canal, et les grumes de peuplier des bords de Garonne sont sciées sur place.",
  },
  {
    year: "1930",
    title: "La scierie mécanique",
    text: "Après l'arrêt de l'exploitation agricole, la scierie mécanique se développe. Étienne sélectionne lui-même les bois sur pied.",
  },
  {
    year: "1970",
    title: "Le négoce de bois",
    text: "Pierre arrête la scierie pour se consacrer au négoce. Moulures, parquet, bois traités autoclave, bois exotiques et découpe de panneaux sur mesure rejoignent l'offre.",
  },
  {
    year: "2012",
    title: "La cinquième génération",
    text: "Benoît reprend l'entreprise et développe la fabrication sur mesure et la livraison, en gardant les valeurs familiales.",
  },
]

export default async function QuiSommesNousPage() {
  const [about, historyImage, familyImage] = await Promise.all([
    getAboutTexts(),
    getSiteImage(SITE_KEYS.aboutHistory),
    getSiteImage(SITE_KEYS.homeFamily),
  ])

  const missionTitle = about?.missionTitle?.trim() || "Notre mission"
  const locationTitle = about?.locationTitle?.trim() || "Notre localisation"

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: absoluteUrl("/qui-sommes-nous"),
          name: "Qui sommes-nous – Reyssac Bois",
          about: { "@id": BUSINESS_ID },
          mainEntity: {
            "@id": BUSINESS_ID,
            founder: { "@type": "Person", name: "Jean Reyssac" },
            foundingDate: String(BUSINESS.foundingYear),
          },
        }}
      />
      <Container className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          <PageHeader
            eyebrow="L'ENTREPRISE"
            title="Reyssac Bois, négoce de bois familial à Agen depuis 1850"
            crumb={{ name: "Qui sommes-nous", href: "/qui-sommes-nous" }}
          >
            <p>
              Installée à Boé, aux portes d&apos;Agen, Reyssac Bois est une entreprise familiale et
              indépendante transmise de père en fils depuis cinq générations. D&apos;abord scierie,
              aujourd&apos;hui négoce de bois, elle accompagne particuliers et professionnels, « de la
              baguette à la palette ».
            </p>
          </PageHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <PageCard title="Notre histoire" className="lg:col-span-3">
              <ol className="relative space-y-6 border-l-2 border-green-200 pl-5">
                {TIMELINE.map((step) => (
                  <li key={step.year} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-green-700 ring-4 ring-white"
                    />
                    <p className="text-sm font-bold text-green-800">{step.year}</p>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm sm:text-base leading-relaxed text-gray-700">{step.text}</p>
                  </li>
                ))}
              </ol>
            </PageCard>

            <div className="space-y-6 lg:col-span-2">
              {[historyImage, familyImage].filter(Boolean).map((img) => (
                <div
                  key={img!.src}
                  className="overflow-hidden rounded-3xl border border-white/15 bg-white/60 shadow-sm ring-1 ring-black/5"
                >
                  <div className="aspect-[4/3] w-full">
                    <Media src={img!.src} alt={img!.alt || "Reyssac Bois, Boé"} className="h-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PageCard title={missionTitle}>
              {about?.missionTextHtml ? (
                <RichText html={about.missionTextHtml} className="text-gray-700 text-base" />
              ) : (
                <p className="text-base leading-relaxed text-gray-700">
                  {about?.missionText ||
                    "La satisfaction et la fidélisation de nos clients. Nous favorisons les produits d'origine française et certifiés PEFC."}
                </p>
              )}
            </PageCard>
            <PageCard title={locationTitle}>
              {about?.locationTextHtml ? (
                <RichText html={about.locationTextHtml} className="text-gray-700 text-base" />
              ) : (
                <p className="text-base leading-relaxed text-gray-700">
                  {about?.locationText ||
                    "Aux portes d'Agen et à mi-chemin entre Bordeaux et Toulouse, nous sommes au cœur du Sud-Ouest."}
                </p>
              )}
            </PageCard>
          </div>

          <PageCard title="Ce que nous proposons">
            <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:text-base">
              <li>
                <Link href="/produits" className="font-semibold text-green-800 hover:underline">
                  Un large stock de bois et de panneaux →
                </Link>
              </li>
              <li>
                <Link href="/decoupe-panneaux-sur-mesure" className="font-semibold text-green-800 hover:underline">
                  La découpe de panneaux sur mesure →
                </Link>
              </li>
              <li>
                <Link href="/categories/fabrication-sur-mesure" className="font-semibold text-green-800 hover:underline">
                  Le travail du bois à façon →
                </Link>
              </li>
              <li>
                <Link href="/livraison-bois" className="font-semibold text-green-800 hover:underline">
                  La livraison en Lot-et-Garonne et au-delà →
                </Link>
              </li>
            </ul>
          </PageCard>
        </div>
      </Container>

      <LocalSeoBand
        heading="Venez nous rencontrer à Boé"
        paragraphs={[
          "Notre équipe vous accueille au dépôt, aux portes d'Agen, pour vous conseiller sur le choix des essences, des sections et des quantités adaptées à votre projet.",
        ]}
      />
    </>
  )
}
