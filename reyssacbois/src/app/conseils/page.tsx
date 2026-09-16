import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import PageHeader from "@/components/pages/PageHeader"
import LocalSeoBand from "@/components/LocalSeoBand"
import { getPublishedArticles } from "@/lib/editorial"

export const metadata: Metadata = {
  title: "Conseils bois : contreplaqué, charpente, terrasse, bardage",
  description:
    "Guides pratiques de Reyssac Bois, négoce de bois près d'Agen : choisir son contreplaqué, ses bois de charpente, sa terrasse, son bardage et son traitement.",
  alternates: { canonical: "/conseils" },
  openGraph: { title: "Conseils bois – Reyssac Bois", url: "/conseils" },
}

export default async function ConseilsPage() {
  const articles = await getPublishedArticles()

  return (
    <>
      <Container className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          <PageHeader eyebrow="CONSEILS" title="Conseils et guides bois" crumb={{ name: "Conseils", href: "/conseils" }}>
            <p>
              Nos conseils de négociant pour bien choisir vos bois et panneaux, préparer vos chantiers et faire
              durer vos ouvrages.
            </p>
          </PageHeader>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/conseils/${a.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-white/15 bg-white/60 p-6 backdrop-blur shadow-sm ring-1 ring-black/5 transition hover:bg-white/80"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-800">{a.title}</h2>
                  <p className="mt-2 flex-1 text-sm sm:text-base leading-relaxed text-gray-700">{a.excerpt}</p>
                  <span className="mt-4 text-sm font-semibold text-green-800">
                    Lire le guide <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <LocalSeoBand
        heading="Un conseil pour votre projet ?"
        paragraphs={[
          "Notre équipe vous conseille au comptoir ou par téléphone sur le choix des essences, des sections, des traitements et des quantités, pour les particuliers comme pour les professionnels.",
        ]}
      />
    </>
  )
}
