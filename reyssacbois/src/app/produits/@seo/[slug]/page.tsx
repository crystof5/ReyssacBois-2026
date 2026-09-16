import LocalSeoBand from "@/components/LocalSeoBand"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"
import { getProductLocalSeo } from "@/lib/productSeo"

export default async function ProductSeoSlot({
  params,
}: {
  params: Promise<{ slug?: string }>
}) {
  const { slug } = await params
  if (!slug) return null

  const data = await getProductBreadcrumb(slug)
  if (!data) return null

  const { heading, paragraphs } = getProductLocalSeo(data.product.name, data.categories.at(-1)?.name)
  return <LocalSeoBand heading={heading} paragraphs={paragraphs} />
}
