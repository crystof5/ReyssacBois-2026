const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  // Admin (optionnel) : créer/mettre à jour l'utilisateur admin via variables d'env
  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    // Tolérance: certains environnements utilisent ADMIN_EMAILS (liste) pour d'autres features.
    (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",")[0] : "") ||
    ""
  )
    .trim()
    .toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || ""
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: { email: adminEmail, passwordHash },
    })
    console.log("✅ Admin seeded/updated:", adminEmail)
  }

  // Catégories (évite de dupliquer si la DB est déjà remplie)
  const existingCategories = await prisma.category.count()
  if (existingCategories > 0) {
    console.log("ℹ️ Categories already exist, skipping categories seed.")
    return
  }

  // Catégories racines
  const boisMenuiserie = await prisma.category.create({
    data: {
      name: "Bois de menuiserie de pays",
      slug: "bois-de-menuiserie-de-pays",
      description:
        "Bois massifs Français secs - Avivés ou plots - Différentes épaisseurs disponibles",
      isTopCategory: true,
    },
  })

  const charpente = await prisma.category.create({
    data: {
      name: "Charpente",
      slug: "charpente",
      description:
        "Bois massif traditionnel - Epicéa du Jura - Brut - Traité CL2",
      isTopCategory: true,
    },
  })

  const terrasse = await prisma.category.create({
    data: {
      name: "Lame de terrasse",
      slug: "lame-de-terrasse",
      description: "Pin Sylvestre traité CL4 - Exotique - Bambou",
      isTopCategory: true,
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
