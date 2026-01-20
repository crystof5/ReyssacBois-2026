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

  if (!base) return base

  const isPooler = /\bpooler\.supabase\.com\b/i.test(base)

  // Garde-fou: limite le pool côté Prisma quand on passe par un pooler,
  // sinon on peut saturer et tomber en 500 (surtout en serverless).
  if (isPooler) {
    // Prisma + pgbouncer/transaction pooling: recommandé si tu utilises le pooler.
    // (Inoffensif même si le pooler est en session mode.)
    const withPgbouncer = withQueryParam(base, "pgbouncer", "true")
    return withQueryParam(withPgbouncer, "connection_limit", "1")
  }

  // Sur Vercel (serverless), même en "direct", plusieurs lambdas peuvent créer trop de connexions.
  // On force donc un pool minimal côté Prisma.
  if (process.env.VERCEL) {
    return withQueryParam(base, "connection_limit", "1")
  }

  // En dev, on limite aussi le nombre de connexions pour éviter les erreurs si la DB est petite.
  if (process.env.NODE_ENV !== "production") {
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
