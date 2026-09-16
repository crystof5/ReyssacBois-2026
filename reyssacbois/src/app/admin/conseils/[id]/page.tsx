import { notFound } from "next/navigation"
import AdminPageHeader from "@/admin/components/editorial/AdminPageHeader"
import ArticleEditor from "@/admin/components/editorial/ArticleEditor"
import DeleteArticleButton from "@/admin/components/editorial/DeleteArticleButton"
import { getAdminArticles, getSettingUpdatedAt } from "@/admin/queries/editorial"
import { EDITORIAL_KEYS } from "@/lib/editorial"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type Node = { id: string; name: string; slug: string; parentId: string | null; isVisible: boolean }

function categoryOptions(categories: Node[]) {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const pathOf = (c: Node) => {
    const names = [c.name]
    let cur = c.parentId ? byId.get(c.parentId) : undefined
    let guard = 0
    while (cur && guard++ < 10) {
      names.unshift(cur.name)
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
    return names.join(" › ")
  }
  return categories
    .filter((c) => c.isVisible)
    .map((c) => ({ slug: c.slug, label: pathOf(c) }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"))
}

export default async function AdminConseilEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [articles, updatedAt, categories] = await Promise.all([
    getAdminArticles(),
    getSettingUpdatedAt(EDITORIAL_KEYS.articles),
    prisma.category.findMany({ select: { id: true, name: true, slug: true, parentId: true, isVisible: true } }),
  ])
  const article = articles.find((a) => a.id === id)
  if (!article) notFound()

  return (
    <div>
      <AdminPageHeader
        title={article.title || "Guide sans titre"}
        subtitle="Modifiez le guide puis enregistrez. Les brouillons restent invisibles sur le site."
        crumbs={[
          { label: "Pages & conseils", href: "/admin/pages" },
          { label: "Conseils", href: "/admin/conseils" },
          { label: "Modifier" },
        ]}
        actions={<DeleteArticleButton id={article.id} />}
      />
      <ArticleEditor
        key={`${article.id}-${updatedAt?.getTime() ?? 0}`}
        initial={{
          id: article.id,
          slug: article.slug,
          isVisible: article.isVisible,
          title: article.title,
          metaTitle: article.metaTitle,
          description: article.description,
          excerpt: article.excerpt,
          intro: article.intro,
          publishedAt: article.publishedAt,
          sections: article.sections,
          faq: article.faq,
          related: article.related,
        }}
        categories={categoryOptions(categories)}
      />
    </div>
  )
}
