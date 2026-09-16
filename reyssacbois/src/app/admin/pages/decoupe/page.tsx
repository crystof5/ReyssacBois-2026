import ServicePageAdmin from "@/admin/components/editorial/ServicePageAdmin"
import { getSettingUpdatedAt } from "@/admin/queries/editorial"
import { EDITORIAL_KEYS, getDefaultDecoupe, type DecoupePage } from "@/lib/editorial"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminDecoupePage({ searchParams }: { searchParams?: Promise<{ reset?: string }> }) {
  const sp = (await searchParams) ?? {}
  const [row, updatedAt] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: EDITORIAL_KEYS.decoupe }, select: { value: true } }),
    getSettingUpdatedAt(EDITORIAL_KEYS.decoupe),
  ])
  const page: DecoupePage = { ...getDefaultDecoupe(), ...((row?.value as unknown as Partial<DecoupePage>) ?? {}) }

  return (
    <ServicePageAdmin
      page="decoupe"
      title="Page Découpe sur mesure"
      path="/decoupe-panneaux-sur-mesure"
      initial={page}
      updatedAt={updatedAt}
      reset={Boolean(sp.reset)}
    />
  )
}
