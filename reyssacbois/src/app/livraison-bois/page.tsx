import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import FaqSection from "@/components/pages/FaqSection"
import LocalSeoBand from "@/components/LocalSeoBand"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import { AGEN_AREA_CITIES, BUSINESS } from "@/lib/business"
import { getFeaturedCategoryLinks } from "@/lib/featuredCategories"
import { absoluteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Livraison de bois à Agen, Lot-et-Garonne, Gers, Tarn-et-Garonne",
  description:
    "Livraison de bois de charpente, panneaux, contreplaqués, bardage et terrasse dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne.",
  alternates: { canonical: "/livraison-bois" },
  openGraph: { title: "Livraison de bois à Agen et dans le Sud-Ouest", url: "/livraison-bois" },
}

const ZONES = [
  {
    title: "Agen et son agglomération",
    badge: "Zone prioritaire",
    text: "Au départ de notre dépôt de Boé, nous livrons en priorité Agen et les communes voisines :",
    places: AGEN_AREA_CITIES as readonly string[],
  },
  {
    title: "Lot-et-Garonne, Gers et Tarn-et-Garonne",
    badge: "Livraisons régulières",
    text: "Nous livrons dans tout le Lot-et-Garonne (47) et les départements voisins du Gers (32) et du Tarn-et-Garonne (82), par exemple :",
    places: [
      "Villeneuve-sur-Lot",
      "Marmande",
      "Nérac",
      "Casteljaloux",
      "Tonneins",
      "Fumel",
      "Auch",
      "Condom",
      "Lectoure",
      "Montauban",
      "Moissac",
      "Valence d'Agen",
    ],
  },
  {
    title: "De Bordeaux à Toulouse",
    badge: "Sur devis",
    text: "Au-delà, nous étudions chaque demande selon le volume et la distance, le long de l'axe Garonne :",
    places: ["Bordeaux", "Langon", "Toulouse", "Castelsarrasin"],
  },
]

const STEPS = [
  {
    title: "Votre demande",
    text: "Appelez-nous ou envoyez votre liste (produits, sections, longueurs, quantités) et l'adresse de livraison.",
  },
  {
    title: "Votre devis",
    text: "Nous vérifions la disponibilité et chiffrons la marchandise et la livraison, calculée selon le volume et la distance.",
  },
  {
    title: "La préparation",
    text: "Votre commande est préparée au dépôt de Boé, avec la découpe sur mesure des panneaux si besoin.",
  },
  {
    title: "La livraison",
    text: "Nous livrons à l'adresse convenue : chantier, entreprise ou domicile.",
  },
]

const FAQ = [
  {
    question: "Livrez-vous les particuliers ?",
    answer:
      "Oui. Nous livrons aussi bien les particuliers que les artisans, entreprises et collectivités, dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne.",
  },
  {
    question: "Combien coûte la livraison ?",
    answer:
      "Le prix de la livraison dépend du volume, du poids et de la distance. Il est indiqué dans votre devis avant toute commande.",
  },
  {
    question: "Livrez-vous à Bordeaux ou à Toulouse ?",
    answer:
      "Oui, sur devis. Pour les livraisons au-delà du Lot-et-Garonne et des départements voisins, nous étudions chaque demande selon le volume et la distance.",
  },
  {
    question: "Puis-je faire découper mes panneaux avant la livraison ?",
    answer:
      "Oui. Nous découpons vos panneaux sur mesure dans notre atelier de Boé avant de les livrer.",
  },
  {
    question: "Puis-je venir chercher ma commande au dépôt ?",
    answer: `Oui. Le retrait se fait à notre dépôt de Boé, aux portes d'Agen. ${BUSINESS.openingHours.display}.`,
  },
]

export default async function LivraisonBoisPage() {
  const featured = await getFeaturedCategoryLinks()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Livraison de bois",
          serviceType: "Livraison de bois et de panneaux",
          url: absoluteUrl("/livraison-bois"),
          provider: { "@id": BUSINESS_ID },
          areaServed: [
            "Agen",
            "Lot-et-Garonne",
            "Gers",
            "Tarn-et-Garonne",
            "Bordeaux",
            "Toulouse",
          ],
        }}
      />
      <Container className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          <PageHeader
            eyebrow="SERVICE"
            title="Livraison de bois à Agen et dans le Sud-Ouest"
            crumb={{ name: "Livraison de bois", href: "/livraison-bois" }}
          >
            <p>
              Reyssac Bois livre votre bois depuis son dépôt de Boé, aux portes d&apos;Agen : bois de
              charpente, contreplaqués et panneaux, bois de menuiserie, bardage, terrasses, parquet et
              quincaillerie, pour les particuliers comme pour les professionnels.
            </p>
          </PageHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {ZONES.map((zone) => (
              <PageCard key={zone.title}>
                <p className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800 ring-1 ring-green-100">
                  {zone.badge}
                </p>
                <h2 className="mt-3 text-lg sm:text-xl font-bold text-gray-900">{zone.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{zone.text}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {zone.places.map((place) => (
                    <li
                      key={place}
                      className="rounded-full border border-gray-200/80 bg-white/70 px-2.5 py-1 text-xs text-gray-800"
                    >
                      {place}
                    </li>
                  ))}
                </ul>
              </PageCard>
            ))}
          </div>

          <PageCard title="Comment se passe une livraison ?">
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
              >
                Demander un devis de livraison
              </Link>
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-white"
              >
                Appeler le {BUSINESS.phoneDisplay}
              </a>
            </div>
          </PageCard>

          {featured.length ? (
            <PageCard title="Ce que nous livrons">
              <ul className="flex flex-wrap gap-2">
                {featured.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={l.href}
                      className="inline-flex rounded-full border border-gray-200/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-white hover:text-green-800"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-gray-700">
                Besoin de panneaux à vos cotes ? Découvrez notre{" "}
                <Link href="/decoupe-panneaux-sur-mesure" className="font-semibold text-green-800 hover:underline">
                  service de découpe sur mesure
                </Link>
                .
              </p>
            </PageCard>
          ) : null}

          <FaqSection title="Livraison : vos questions" items={FAQ} />
        </div>
      </Container>

      <LocalSeoBand
        heading="Livraison de bois depuis Boé, près d'Agen"
        paragraphs={[
          "Négoce familial depuis 1850, Reyssac Bois prépare et livre vos commandes de bois et de panneaux dans l'agglomération d'Agen, tout le Lot-et-Garonne, le Gers et le Tarn-et-Garonne.",
          "Pour les chantiers plus éloignés, de Bordeaux à Toulouse, contactez-nous : nous étudions votre demande sur devis.",
        ]}
      />
    </>
  )
}
