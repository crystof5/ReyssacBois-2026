import { NextResponse, type NextRequest } from "next/server"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getAdminUserFromRequest } from "@/lib/adminAuth"
import { extractKeyFromPublicUrl, getR2Client, getR2Env } from "@/lib/r2"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const user = await getAdminUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
    }

    let body: { publicUrl?: string; bucket?: string }
    try {
      const raw: unknown = await req.json()
      if (!raw || typeof raw !== "object") {
        return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 })
      }
      body = raw as { publicUrl?: string; bucket?: string }
    } catch {
      return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 })
    }

    const publicUrl = (body.publicUrl ?? "").trim()
    if (!publicUrl) {
      return NextResponse.json({ ok: false, error: "URL manquante" }, { status: 400 })
    }

    const key = extractKeyFromPublicUrl(publicUrl)
    if (!key) {
      return NextResponse.json(
        { ok: false, error: "URL non reconnue" },
        { status: 400 }
      )
    }

    const { bucket } = getR2Env()
    const s3 = getR2Client()
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error ? e.message : "Erreur serveur lors de la suppression.",
      },
      { status: 500 }
    )
  }
}

