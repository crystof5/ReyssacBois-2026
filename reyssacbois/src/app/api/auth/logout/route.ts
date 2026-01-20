import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_SESSION_COOKIE, revokeAdminSessionFromRequest } from "@/lib/adminAuth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  await revokeAdminSessionFromRequest(req)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  })
  return res
}

