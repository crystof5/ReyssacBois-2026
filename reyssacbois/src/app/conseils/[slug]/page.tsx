import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import FaqSection from "@/components/pages/FaqSection"
import LocalSeoBand from "@/components/LocalSeoBand"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import RichText from "@/components/ui/RichText"
import { getPublishedArticle, getPublishedArticles } from "@/lib/editorial"
import { getCategoriesTree } from "@/lib/categories"
import { absoluteUrl } from "@/lib/seo"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getPublishedArticle((await params).slug)
  if (!article) return { robots: { index: false, follow: false } }
  return {
    title: article.metaTitle,
    description: article.description,
    alternates: { canonical: `/conseils/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/conseils/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
  }
}

type Node = { slug: string; name: string; children?: Node[] }

function collectNames(nodes: Node[], out = new Map<string, string>()): Map<string, string> {
  for (const n of nodes) {
    out.set(n.slug, n.name)
    if (n.children?.length) collectNames(n.children, out)
  }
  return out
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })

export default async function ConseilPage({ params }: Params) {
  const article = await getPublishedArticle((await params).slug)
  if (!article) notFound()

  const [tree, allArticles] = await Promise.all([getCategoriesTree(), getPublishedArticles()])
  const names = collectNames(tree as unknown as Node[])
  const related = article.related
    .filter((slug) => names.has(slug))
    .map((slug) => ({ slug, label: names.get(slug) as string }))
  const others = allArticles.filter((a) => a.slug !== article.slug)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt || article.publishedAt,
          inLanguage: "fr-FR",
          mainEntityOfPage: absoluteUrl(`/conseils/${article.slug}`),
          author: { "@id": BUSINESS_ID },
          publisher: { "@id": BUSINESS_ID },
        }}
      />
      <Container className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <PageHeader eyebrow="CONSEILS" title={article.title} crumb={{ name: "Conseils", href: "/conseils" }}>
            <p className="text-sm text-gray-500">
              Par Reyssac Bois ·{" "}
              <time dateTime={article.publishedAt}>{dateFormat.format(new Date(article.publishedAt))}</time>
            </p>
            <p>{article.intro}</p>
          </PageHeader>

          <PageCard>
            <div className="space-y-8">
              {article.sections.map((section) => (
                <section key={section.id}>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{section.heading}</h2>
                  <RichText html={section.html} className="mt-3 text-base text-gray-700 [&_li]:my-1.5" />
                </section>
              ))}
            </div>
          </PageCard>

          {related.length ? (
            <PageCard title="Voir les produits">
              <ul className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/categories/${r.slug}`}
                      className="inline-flex rounded-full border border-gray-200/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-white hover:text-green-800"
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </PageCard>
          ) : null}

          {article.faq.length ? <FaqSection items={article.faq} /> : null}

          {others.length ? (
          <PageCard title="Autres conseils">
            <ul className="space-y-2">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link href={`/conseils/${a.slug}`} className="font-semibold text-green-800 hover:underline">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </PageCard>
          ) : null}
        </div>
      </Container>

      <LocalSeoBand
        heading="Besoin d'un conseil personnalisé ?"
        paragraphs={[
          "Chez Reyssac Bois, à Boé près d'Agen, notre équipe vous aide à choisir les bons produits et les bonnes quantités, puis prépare, découpe et livre votre commande.",
        ]}
      />
    </>
  )
}
