import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { ADMIN_SESSION_COOKIE, hashSessionToken } from "@/lib/adminAuth"

export const runtime = "nodejs"

const SESSION_DAYS = 30

function getBootstrapAdminEnv() {
  const emailRaw =
    process.env.ADMIN_EMAIL?.trim() ||
    // Tolérance: certains environnements utilisent ADMIN_EMAILS (liste) pour d'autres features.
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    ""
  const password = process.env.ADMIN_PASSWORD || ""
  return { email: emailRaw.toLowerCase(), password }
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    const raw: unknown = await req.json()
    body = (raw ?? {}) as { email?: string; password?: string }
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 400 })
  }

  let user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user) {
    // Bootstrap: si aucun admin n'existe encore, on autorise une création à la 1ère connexion
    // uniquement si l'email/mdp matchent les variables d'env serveur.
    const bootstrap = getBootstrapAdminEnv()
    if (bootstrap.email && bootstrap.password && email === bootstrap.email && password === bootstrap.password) {
      const passwordHash = await bcrypt.hash(bootstrap.password, 12)
      user = await prisma.adminUser.upsert({
        where: { email: bootstrap.email },
        update: { passwordHash },
        create: { email: bootstrap.email, passwordHash },
      })
    } else {
      return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 })
    }
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 })
  }

  const token = crypto.randomBytes(32).toString("base64url")
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.adminSession.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  })

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
  return res
}

