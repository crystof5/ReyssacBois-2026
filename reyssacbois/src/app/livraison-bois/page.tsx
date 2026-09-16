import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import FaqSection from "@/components/pages/FaqSection"
import LocalSeoBand from "@/components/LocalSeoBand"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import { BUSINESS } from "@/lib/business"
import { getLivraisonPage } from "@/lib/editorial"
import RichText from "@/components/ui/RichText"
import { getFeaturedCategoryLinks } from "@/lib/featuredCategories"
import { absoluteUrl } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLivraisonPage()
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: "/livraison-bois" },
    openGraph: { title: page.title, description: page.description, url: "/livraison-bois" },
  }
}

export default async function LivraisonBoisPage() {
  const [featured, page] = await Promise.all([getFeaturedCategoryLinks(), getLivraisonPage()])

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
            title={page.title}
            crumb={{ name: "Livraison de bois", href: "/livraison-bois" }}
          >
            {page.introHtml ? <RichText html={page.introHtml} /> : null}
          </PageHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {page.zones.map((zone) => (
              <PageCard key={zone.id}>
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
              {page.steps.map((step, i) => (
                <li key={step.id} className="flex gap-3">
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

          {page.faq.length ? <FaqSection title="Livraison : vos questions" items={page.faq} /> : null}
        </div>
      </Container>

      <LocalSeoBand
        heading={page.bandHeading}
        paragraphs={page.bandText.split(/\n+/).filter(Boolean)}
      />
    </>
  )
}
