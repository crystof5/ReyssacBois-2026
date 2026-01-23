import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { ADMIN_SESSION_COOKIE, hashSessionToken } from "@/lib/adminAuth"

export const runtime = "nodejs"

const SESSION_HOURS = 48
const FAIL_DELAY_MS = 650

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function getClientIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for") || ""
  const first = xf.split(",")[0]?.trim()
  return first || req.headers.get("x-real-ip") || null
}

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
  const ip = getClientIp(req)
  const userAgent = req.headers.get("user-agent") || null

  let body: { email?: string; password?: string }
  try {
    const raw: unknown = await req.json()
    body = (raw ?? {}) as { email?: string; password?: string }
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""

  // Garde-fous (anti DoS + validation minimale)
  if (!email || email.length > 254 || !password || password.length > 200) {
    await sleep(FAIL_DELAY_MS)
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 400 })
  }

  let user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user) {
    // Bootstrap: si aucun admin n'existe encore, on autorise une création à la 1ère connexion
    // uniquement si l'email/mdp matchent les variables d'env serveur.
    //
    // IMPORTANT: en production, ce mode doit être activé explicitement et temporairement
    // (sinon un attaquant peut brute-force le couple email/mdp env sur une base fraîche).
    const bootstrapEnabled = process.env.ADMIN_BOOTSTRAP_ENABLED === "1"
    const hasAnyAdmin = (await prisma.adminUser.count()) > 0
    const bootstrap = getBootstrapAdminEnv()
    if (
      !hasAnyAdmin &&
      bootstrapEnabled &&
      bootstrap.email &&
      bootstrap.password &&
      email === bootstrap.email &&
      password === bootstrap.password
    ) {
      const passwordHash = await bcrypt.hash(bootstrap.password, 12)
      user = await prisma.adminUser.upsert({
        where: { email: bootstrap.email },
        update: { passwordHash },
        create: { email: bootstrap.email, passwordHash },
      })
    } else {
      // Délai défensif (anti brute-force)
      await sleep(FAIL_DELAY_MS)
      return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 })
    }
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    await sleep(FAIL_DELAY_MS)
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 })
  }

  const token = crypto.randomBytes(32).toString("base64url")
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000)

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

  // (Optionnel) On pourrait logger ip/userAgent ici si tu veux de l’audit.
  void ip
  void userAgent

  return res
}

