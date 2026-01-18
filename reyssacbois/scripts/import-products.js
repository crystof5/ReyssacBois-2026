const fs = require("fs")
const { parse } = require("csv-parse/sync")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const records = parse(
  fs.readFileSync("data/products.csv"),
  { columns: true, skip_empty_lines: true }
)

async function main() {
  for (const row of records) {
    const product = await prisma.product.upsert({
      where: { slug: row.slug },
      update: {},
      create: {
        slug: row.slug,
        name: row.name,
        description: row.description || null,
        section: row.section || null,
        length: row.length || null,
        species: row.species || null,
        standard: row.standard || null,
      },
    })

    const categorySlugs = row.categories.split("|")

    for (const slug of categorySlugs) {
      const category = await prisma.category.findUnique({
        where: { slug },
      })

      if (!category) {
        throw new Error(`Catégorie inconnue: ${slug}`)
      }

      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: product.id,
            categoryId: category.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          categoryId: category.id,
        },
      })
    }
  }
}

main()
  .then(() => {
    console.log("✅ Produits importés")
    prisma.$disconnect()
  })
  .catch(console.error)
