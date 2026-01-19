import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createSupabaseServiceClient } from "@/lib/supabase/service"
import { getAdminEmails, getSupabaseEnv } from "@/lib/supabase/env"

function extractObjectPath(publicUrl: string, bucket: string) {
  const url = new URL(publicUrl)
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.pathname.indexOf(marker)
  if (idx === -1) return null
  const path = url.pathname.slice(idx + marker.length)
  const decoded = decodeURIComponent(path)
  if (!decoded || decoded.startsWith("..")) return null
  return decoded
}

export async function POST(req: NextRequest) {
  try {
    const { url, anonKey } = getSupabaseEnv()

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll() {
          // noop (API)
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
    }

    const allowed = getAdminEmails()
    if (allowed.length > 0) {
      const email = (user.email ?? "").toLowerCase()
      if (!allowed.includes(email)) {
        return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 403 })
      }
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

    const bucket = (body.bucket ?? "images").trim() || "images"
    const publicUrl = (body.publicUrl ?? "").trim()
    if (!publicUrl) {
      return NextResponse.json({ ok: false, error: "URL manquante" }, { status: 400 })
    }

    const objectPath = extractObjectPath(publicUrl, bucket)
    if (!objectPath) {
      return NextResponse.json(
        { ok: false, error: "URL non reconnue pour ce bucket" },
        { status: 400 }
      )
    }

    const service = createSupabaseServiceClient()
    const { error } = await service.storage.from(bucket).remove([objectPath])
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

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

