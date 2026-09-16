import { absoluteUrl } from "@/lib/seo"
import {
  AGEN_AREA_CITIES,
  BUSINESS,
  DELIVERY_DEPARTMENTS,
  EXTENDED_DELIVERY_CITIES,
} from "@/lib/business"

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // `<` échappé : empêche toute fermeture prématurée de la balise script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

export const BUSINESS_ID = `${absoluteUrl("/")}#business`

function sameAsUrls(): string[] {
  return [process.env.NEXT_PUBLIC_FACEBOOK_URL, process.env.NEXT_PUBLIC_INSTAGRAM_URL]
    .map((v) => (v ?? "").trim())
    .filter((v) => /^https?:\/\//i.test(v))
}

export function LocalBusinessJsonLd() {
  const { address, geo, openingHours } = BUSINESS

  const data = {
    "@context": "https://schema.org",
    "@type": ["HomeAndConstructionBusiness", "Store"],
    "@id": BUSINESS_ID,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description:
      "Négoce de bois à Boé, aux portes d'Agen : bois de charpente, contreplaqués et panneaux, bois de menuiserie et d'ébénisterie, bois exotiques, parquet, lambris, bardage, terrasses, quincaillerie. Découpe sur mesure, fabrication sur mesure et livraison en Lot-et-Garonne, Gers et Tarn-et-Garonne.",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/android-chrome-512x512.png"),
    image: absoluteUrl("/android-chrome-512x512.png"),
    telephone: BUSINESS.phoneE164,
    foundingDate: String(BUSINESS.foundingYear),
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    hasMap: BUSINESS.mapsUrl,
    openingHoursSpecification: openingHours.slots.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: openingHours.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    areaServed: [
      ...AGEN_AREA_CITIES.map((name) => ({ "@type": "City", name })),
      ...DELIVERY_DEPARTMENTS.map((d) => ({
        "@type": "AdministrativeArea",
        name: `${d.name} (${d.code})`,
      })),
      ...EXTENDED_DELIVERY_CITIES.map((name) => ({ "@type": "City", name })),
    ],
    knowsAbout: [
      "Contreplaqué",
      "Bois de charpente",
      "Poutres et poteaux bois",
      "Madriers et bastaings",
      "Solives et chevrons",
      "Bois de menuiserie",
      "Bois exotiques",
      "Sapin du Nord",
      "Panneaux bois (OSB, MDF, aggloméré, lamellé-collé)",
      "Parquet",
      "Lambris",
      "Bardage bois",
      "Terrasse bois",
      "Planches de coffrage",
      "Tasseaux et moulures",
      "Portes et blocs-portes",
      "Quincaillerie",
      "Découpe de panneaux sur mesure",
      "Fabrication sur mesure",
      "Livraison de bois",
    ],
    sameAs: sameAsUrls(),
  }

  return <JsonLd data={data} />
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  }
  return <JsonLd data={data} />
}
