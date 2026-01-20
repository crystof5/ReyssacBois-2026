import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

function withQueryParam(url: string, key: string, value: string) {
  try {
    const u = new URL(url)
    if (!u.searchParams.has(key)) u.searchParams.set(key, value)
    return u.toString()
  } catch {
    return url
  }
}

function getPrismaDatasourceUrl() {
  // En dev, Turbopack/SSR peut multiplier les initialisations et saturer un pooler "session mode".
  // Si DIRECT_URL est défini, on l'utilise en priorité en dehors de la prod.
  const direct = process.env.DIRECT_URL?.trim()
  const pooled = process.env.DATABASE_URL?.trim()

  const base =
    process.env.NODE_ENV !== "production" && direct ? direct : pooled || direct

  // Garde-fou: limite le pool côté Prisma en dev pour éviter de saturer un pooler.
  // (N'a pas d'impact sur la DB "directe", et réduit fortement les erreurs "max clients".)
  if (process.env.NODE_ENV !== "production" && base) {
    return withQueryParam(base, "connection_limit", "1")
  }

  return base
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: getPrismaDatasourceUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
