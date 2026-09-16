import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import FaqSection from "@/components/pages/FaqSection"
import LocalSeoBand from "@/components/LocalSeoBand"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import { BUSINESS } from "@/lib/business"
import { getDecoupePage } from "@/lib/editorial"
import RichText from "@/components/ui/RichText"
import { getCategoriesTree } from "@/lib/categories"
import { absoluteUrl } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getDecoupePage()
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: "/decoupe-panneaux-sur-mesure" },
    openGraph: { title: page.title, description: page.description, url: "/decoupe-panneaux-sur-mesure" },
  }
}

const PANELS = [
  { slug: "contreplaques", label: "Contreplaqués", text: "Peuplier, okoumé, bouleau, bakélisé, cintrable…" },
  { slug: "osb-3", label: "OSB 3", text: "Panneaux et dalles de plancher." },
  { slug: "medium-mdf", label: "Médium MDF", text: "Standard, hydrofuge, teinté dans la masse." },
  { slug: "agglomere", label: "Aggloméré", text: "Standard, hydrofuge, mélaminé, replaqué." },
  { slug: "lamelle-colles", label: "Lamellé-collés", text: "Chêne, hévéa, pin des landes, plans de travail." },
  { slug: "latte-3-plis", label: "Latté / 3 plis", text: "Panneaux stables pour l'agencement." },
]

type Node = { slug: string; children?: Node[] }

function collectSlugs(nodes: Node[], out = new Set<string>()): Set<string> {
  for (const n of nodes) {
    out.add(n.slug)
    if (n.children?.length) collectSlugs(n.children, out)
  }
  return out
}

export default async function DecoupePanneauxPage() {
  const [tree, page] = await Promise.all([getCategoriesTree(), getDecoupePage()])
  const visible = collectSlugs(tree as unknown as Node[])
  const panels = PANELS.filter((p) => visible.has(p.slug))

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Découpe de panneaux bois sur mesure",
          serviceType: "Découpe de panneaux",
          url: absoluteUrl("/decoupe-panneaux-sur-mesure"),
          provider: { "@id": BUSINESS_ID },
          areaServed: ["Agen", "Lot-et-Garonne", "Gers", "Tarn-et-Garonne"],
        }}
      />
      <Container className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          <PageHeader
            eyebrow="SERVICE"
            title={page.title}
            crumb={{ name: "Découpe sur mesure", href: "/decoupe-panneaux-sur-mesure" }}
          >
            {page.introHtml ? <RichText html={page.introHtml} /> : null}
          </PageHeader>

          {panels.length ? (
            <PageCard title="Les panneaux que nous découpons">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {panels.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/categories/${p.slug}`}
                      className="block h-full rounded-2xl border border-gray-200/80 bg-white/70 p-4 transition hover:bg-white hover:shadow-sm"
                    >
                      <span className="font-semibold text-gray-900">{p.label}</span>
                      <span className="mt-1 block text-sm text-gray-700">{p.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </PageCard>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PageCard title="Comment commander une découpe ?">
              <p className="text-sm sm:text-base text-gray-700">
                Passez au dépôt ou envoyez-nous votre liste de débit en précisant :
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm sm:text-base text-gray-700">
                {page.orderInfos.map((info) => (
                  <li key={info}>{info}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
                >
                  Envoyer ma liste de découpe
                </Link>
                <a
                  href={`tel:${BUSINESS.phoneE164}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-white"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </PageCard>

            <PageCard title="Autres travaux à façon">
              <RichText html={page.otherWorksHtml} className="text-sm sm:text-base text-gray-700" />
              <ul className="mt-4 space-y-2 text-sm sm:text-base">
                <li>
                  <Link href="/categories/debit-sur-liste" className="font-semibold text-green-800 hover:underline">
                    Débit de bois sur liste →
                  </Link>
                </li>
                <li>
                  <Link href="/categories/fabrication-sur-mesure" className="font-semibold text-green-800 hover:underline">
                    Fabrication et travail du bois sur mesure →
                  </Link>
                </li>
                <li>
                  <Link href="/livraison-bois" className="font-semibold text-green-800 hover:underline">
                    Livraison de vos panneaux →
                  </Link>
                </li>
              </ul>
            </PageCard>
          </div>

          {page.faq.length ? <FaqSection title="Découpe sur mesure : vos questions" items={page.faq} /> : null}
        </div>
      </Container>

      <LocalSeoBand
        heading={page.bandHeading}
        paragraphs={page.bandText.split(/\n+/).filter(Boolean)}
      />
    </>
  )
}
