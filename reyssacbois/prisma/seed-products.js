const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  // 1️⃣ Récupération des catégories
  const charpente = await prisma.category.findUnique({
    where: { slug: "charpente" },
  })

  const chevrons = await prisma.category.findUnique({
    where: { slug: "chevrons" },
  })

  const menuiserie = await prisma.category.findUnique({
    where: { slug: "bois-de-menuiserie-de-pays" },
  })

  if (!charpente || !chevrons || !menuiserie) {
    throw new Error("❌ Catégories manquantes")
  }

  // 2️⃣ Création des produits
  const chevron63 = await prisma.product.create({
    data: {
      name: "Chevron épicéa 63x175",
      slug: "chevron-epicea-63x175",
      description:
        "Chevron en épicéa du Jura, brut, idéal pour charpente traditionnelle.",
      section: "63x175 mm",
      species: "Épicéa",
      standard: "CL2",
    },
  })

  const plancheChene = await prisma.product.create({
    data: {
      name: "Planche chêne massif",
      slug: "planche-chene-massif",
      description:
        "Chêne de Bourgogne, séchage naturel, bois de menuiserie.",
      species: "Chêne",
    },
  })

  // 3️⃣ Liaisons produit ↔ catégories
  await prisma.productCategory.createMany({
    data: [
      {
        productId: chevron63.id,
        categoryId: charpente.id,
      },
      {
        productId: chevron63.id,
        categoryId: chevrons.id,
      },
      {
        productId: plancheChene.id,
        categoryId: menuiserie.id,
      },
    ],
  })
}

main()
  .then(async () => {
    console.log("✅ Produits seedés")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
