import LocalSeoBand from "@/components/LocalSeoBand"
import { getCategoryBreadcrumb } from "@/lib/breadcrumbs"
import { getCategorySeo } from "@/lib/categorySeo"
import { getArticleForCategory } from "@/lib/articles"

export default async function CategorySeoSlot({
  params,
}: {
  params: Promise<{ slug?: string }>
}) {
  const { slug } = await params
  if (!slug) return null

  const breadcrumb = await getCategoryBreadcrumb(slug)
  if (!breadcrumb?.length) return null

  const { heading, paragraphs } = getCategorySeo(slug, breadcrumb)
  const article = getArticleForCategory(slug)
  return (
    <LocalSeoBand
      heading={heading}
      paragraphs={paragraphs}
      guide={article ? { href: `/conseils/${article.slug}`, title: article.title } : undefined}
    />
  )
}
