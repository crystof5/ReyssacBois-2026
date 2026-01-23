import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromRequest } from "@/lib/adminAuth"

export const runtime = "nodejs"
export const preferredRegion = ["fra1"]

type SearchCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  isVisible: boolean
  parent: { name: string; slug: string } | null
}

type SearchProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  isVisible: boolean
  section: string | null
  length: string | null
  species: string | null
  type: string | null
  standard: string | null
  categories: { category: { name: string; slug: string } }[]
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function scoreText(q: string, text: string | null | undefined) {
  if (!text) return 0
  const t = normalize(text)
  if (!t) return 0
  if (t === q) return 40
  if (t.startsWith(q)) return 24
  if (t.includes(q)) return 10
  return 0
}

function scoreCategory(q: string, c: SearchCategory) {
  return (
    scoreText(q, c.name) * 2 +
    scoreText(q, c.slug) +
    scoreText(q, c.description) +
    scoreText(q, c.parent?.name)
  )
}

function scoreProduct(q: string, p: SearchProduct) {
  const catText = p.categories.map((x) => x.category.name).join(" ")
  return (
    scoreText(q, p.name) * 2 +
    scoreText(q, p.slug) +
    scoreText(q, p.description) +
    scoreText(q, p.section) +
    scoreText(q, p.length) +
    scoreText(q, p.species) +
    scoreText(q, p.type) +
    scoreText(q, p.standard) +
    scoreText(q, catText)
  )
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const raw = String(url.searchParams.get("q") ?? "")
  const q = raw.trim()
  const qn = normalize(q)

  const admin = url.searchParams.get("admin") === "1"
  const limitRaw = Number(url.searchParams.get("limit") ?? 8)
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(20, Math.floor(limitRaw))) : 8

  if (qn.length < 2) {
    return NextResponse.json({ ok: true, q, categories: [], products: [] })
  }

  if (admin) {
    const user = await getAdminUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
    }
  }

  // NB: on limite volontairement (autocomplete) pour éviter de charger la DB.
  // Les listes complètes restent accessibles via /produits et /categories.
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: {
        ...(admin ? {} : { isVisible: true }),
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { parent: { is: { name: { contains: q, mode: "insensitive" } } } },
          { parent: { is: { slug: { contains: q, mode: "insensitive" } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isVisible: true,
        parent: { select: { name: true, slug: true } },
      },
      take: 25,
    }),
    prisma.product.findMany({
      where: {
        ...(admin ? {} : { isVisible: true }),
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { section: { contains: q, mode: "insensitive" } },
          { length: { contains: q, mode: "insensitive" } },
          { species: { contains: q, mode: "insensitive" } },
          { type: { contains: q, mode: "insensitive" } },
          { standard: { contains: q, mode: "insensitive" } },
          {
            categories: {
              some: {
                category: {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isVisible: true,
        section: true,
        length: true,
        species: true,
        type: true,
        standard: true,
        categories: { select: { category: { select: { name: true, slug: true } } } },
      },
      take: 25,
    }),
  ])

  const rankedCategories = categories
    .map((c) => ({ ...c, _score: scoreCategory(qn, c) }))
    .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map(({ _score, ...c }) => c)

  const rankedProducts = products
    .map((p) => ({ ...p, _score: scoreProduct(qn, p) }))
    .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map(({ _score, ...p }) => p)

  return NextResponse.json({
    ok: true,
    q,
    categories: rankedCategories,
    products: rankedProducts,
  })
}

