const fs = require("fs")
const { parse } = require("csv-parse/sync")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const records = parse(
  fs.readFileSync("data/categories.csv"),
  { columns: true, skip_empty_lines: true }
)

async function main() {
  // 1️⃣ Créer toutes les catégories sans parent
  for (const row of records) {
    await prisma.category.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        slug: row.slug,
        name: row.name,
        description: row.description || null,
        imageUrl: row.imageUrl || null,
      },
    })
  }

  // 2️⃣ Ajouter les parents
  for (const row of records) {
    if (!row.parent_slug) continue

    const parent = await prisma.category.findUnique({
      where: { slug: row.parent_slug },
    })

    if (!parent) {
      throw new Error(`Parent manquant: ${row.parent_slug}`)
    }

    await prisma.category.update({
      where: { slug: row.slug },
      data: { parentId: parent.id },
    })
  }
}

main()
  .then(() => {
    console.log("✅ Catégories importées")
    prisma.$disconnect()
  })
  .catch(console.error)
