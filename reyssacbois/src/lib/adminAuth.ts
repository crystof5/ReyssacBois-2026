import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export const ADMIN_SESSION_COOKIE = "rb_admin_session"

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export function hashSessionToken(token: string) {
  return sha256Hex(token)
}

export async function getAdminUserFromCookieStore() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  const tokenHash = hashSessionToken(token)
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session) return null
  if (session.revokedAt) return null
  if (session.expiresAt.getTime() <= Date.now()) return null

  return session.user
}

export async function requireAdmin(redirectTo = "/admin") {
  const user = await getAdminUserFromCookieStore()
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }
  return user
}

export async function getAdminUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  const tokenHash = hashSessionToken(token)
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session) return null
  if (session.revokedAt) return null
  if (session.expiresAt.getTime() <= Date.now()) return null

  return session.user
}

export async function revokeAdminSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return
  const tokenHash = hashSessionToken(token)
  await prisma.adminSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

