const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  // Catégories racines
  const boisMenuiserie = await prisma.category.create({
    data: {
      name: "Bois de menuiserie de pays",
      slug: "bois-de-menuiserie-de-pays",
      description:
        "Bois massifs Français secs - Avivés ou plots - Différentes épaisseurs disponibles",
    },
  })

  const charpente = await prisma.category.create({
    data: {
      name: "Charpente",
      slug: "charpente",
      description:
        "Bois massif traditionnel - Epicéa du Jura - Brut - Traité CL2",
    },
  })

  const terrasse = await prisma.category.create({
    data: {
      name: "Lame de terrasse",
      slug: "lame-de-terrasse",
      description: "Pin Sylvestre traité CL4 - Exotique - Bambou",
    },
  })

  // Sous-catégories
  await prisma.category.create({
    data: {
      name: "Chêne",
      slug: "bois-menuiserie-chene",
      description: "Chêne de Bourgogne - Plot - Séchage naturel",
      parentId: boisMenuiserie.id,
    },
  })

  await prisma.category.create({
    data: {
      name: "Chevrons",
      slug: "chevrons",
      description: "Sections et longueurs diverses pour charpente",
      parentId: charpente.id,
    },
  })

  await prisma.category.create({
    data: {
      name: "Liteaux et contre-liteaux",
      slug: "liteaux-contre-liteaux",
      description: "Liteaux 27x40 / 14x38",
      parentId: charpente.id,
    },
  })
}

main()
  .then(async () => {
    console.log("✅ Categories seeded")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
