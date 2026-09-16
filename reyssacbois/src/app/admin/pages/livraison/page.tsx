import ServicePageAdmin from "@/admin/components/editorial/ServicePageAdmin"
import { getSettingUpdatedAt } from "@/admin/queries/editorial"
import { EDITORIAL_KEYS, getDefaultLivraison, type LivraisonPage } from "@/lib/editorial"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminLivraisonPage({ searchParams }: { searchParams?: Promise<{ reset?: string }> }) {
  const sp = (await searchParams) ?? {}
  const [row, updatedAt] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: EDITORIAL_KEYS.livraison }, select: { value: true } }),
    getSettingUpdatedAt(EDITORIAL_KEYS.livraison),
  ])
  const page: LivraisonPage = { ...getDefaultLivraison(), ...((row?.value as unknown as Partial<LivraisonPage>) ?? {}) }

  return (
    <ServicePageAdmin
      page="livraison"
      title="Page Livraison"
      path="/livraison-bois"
      initial={page}
      updatedAt={updatedAt}
      reset={Boolean(sp.reset)}
    />
  )
}
