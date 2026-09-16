import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import FaqSection from "@/components/pages/FaqSection"
import LocalSeoBand from "@/components/LocalSeoBand"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import { BUSINESS } from "@/lib/business"
import { getCategoriesTree } from "@/lib/categories"
import { absoluteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Découpe de panneaux bois sur mesure à Agen (Boé)",
  description:
    "Découpe sur mesure de contreplaqué, OSB, MDF, aggloméré, mélaminé et lamellé-collé à Boé près d'Agen. Pour particuliers et pros. Retrait ou livraison.",
  alternates: { canonical: "/decoupe-panneaux-sur-mesure" },
  openGraph: { title: "Découpe de panneaux bois sur mesure à Agen", url: "/decoupe-panneaux-sur-mesure" },
}

const PANELS = [
  { slug: "contreplaques", label: "Contreplaqués", text: "Peuplier, okoumé, bouleau, bakélisé, cintrable…" },
  { slug: "osb-3", label: "OSB 3", text: "Panneaux et dalles de plancher." },
  { slug: "medium-mdf", label: "Médium MDF", text: "Standard, hydrofuge, teinté dans la masse." },
  { slug: "agglomere", label: "Aggloméré", text: "Standard, hydrofuge, mélaminé, replaqué." },
  { slug: "lamelle-colles", label: "Lamellé-collés", text: "Chêne, hévéa, pin des landes, plans de travail." },
  { slug: "latte-3-plis", label: "Latté / 3 plis", text: "Panneaux stables pour l'agencement." },
]

const INFOS = [
  "les dimensions de chaque pièce (longueur × largeur) et les quantités ;",
  "le type de panneau et l'épaisseur souhaités ;",
  "le sens du fil ou du décor, si c'est important pour votre projet ;",
  "le retrait au dépôt ou l'adresse de livraison.",
]

const FAQ = [
  {
    question: "Faites-vous la découpe pour les particuliers ?",
    answer:
      "Oui. La découpe de panneaux sur mesure est proposée aux particuliers comme aux professionnels, dans notre dépôt de Boé près d'Agen.",
  },
  {
    question: "Quelles informations dois-je fournir ?",
    answer:
      "Indiquez le type de panneau, l'épaisseur, les dimensions de chaque pièce et les quantités. Une liste de débit, même manuscrite, suffit.",
  },
  {
    question: "Peut-on faire livrer les panneaux découpés ?",
    answer:
      "Oui. Les panneaux découpés peuvent être retirés au dépôt ou livrés dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne.",
  },
  {
    question: "Quel est le délai pour une découpe ?",
    answer:
      "Il dépend de la quantité et de la disponibilité des panneaux. Contactez-nous avec votre liste : nous vous indiquons le délai avec le devis.",
  },
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
  const visible = collectSlugs((await getCategoriesTree()) as unknown as Node[])
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
            title="Découpe de panneaux bois sur mesure à Agen"
            crumb={{ name: "Découpe sur mesure", href: "/decoupe-panneaux-sur-mesure" }}
          >
            <p>
              Depuis des décennies, Reyssac Bois découpe vos panneaux à vos cotes dans son atelier de
              Boé, aux portes d&apos;Agen. Vous repartez avec des pièces prêtes à poser, sans chutes à
              gérer ni grands formats à transporter.
            </p>
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
                {INFOS.map((info) => (
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
              <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                Héritier de la scierie familiale, notre atelier réalise aussi le rabotage, le collage, le
                ponçage et de petits travaux de menuiserie sur mesure.
              </p>
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

          <FaqSection title="Découpe sur mesure : vos questions" items={FAQ} />
        </div>
      </Container>

      <LocalSeoBand
        heading="Découpe de panneaux à Boé, aux portes d'Agen"
        paragraphs={[
          "Contreplaqué, OSB, médium, aggloméré ou lamellé-collé : choisissez votre panneau dans notre stock et repartez avec des pièces découpées à vos dimensions.",
          "Service proposé aux particuliers et aux professionnels de l'agglomération d'Agen et du Lot-et-Garonne, avec retrait au dépôt ou livraison.",
        ]}
      />
    </>
  )
}
