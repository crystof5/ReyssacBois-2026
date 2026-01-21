import { NextResponse, type NextRequest } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getAdminUserFromRequest } from "@/lib/adminAuth"
import { buildR2PublicUrl, getR2Client, getR2Env } from "@/lib/r2"
import { optimizeUploadToWebp, toWebpFilename } from "@/lib/imageOptimize"

export const runtime = "nodejs"

function sanitizeFilename(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function sanitizeFolder(folder: string) {
  const f = folder
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
  if (!f) return "uploads"
  if (f.includes("..")) return "uploads"
  return f
}

export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: "FormData invalide" }, { status: 400 })
  }

  const file = form.get("file")
  const folderRaw = String(form.get("folder") ?? "").trim()
  const folder = sanitizeFolder(folderRaw)

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant" }, { status: 400 })
  }

  const safeName = sanitizeFilename(file.name || "image")

  const arrayBuffer = await file.arrayBuffer()
  const input = Buffer.from(arrayBuffer)

  let body: Buffer
  let contentType: string
  let filenameForKey: string

  try {
    const optimized = await optimizeUploadToWebp({
      input,
      filename: safeName,
      mimeType: file.type || undefined,
    })
    body = optimized.body
    contentType = optimized.contentType
    filenameForKey = optimized.extension === ".webp" ? toWebpFilename(safeName) : safeName
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Image invalide." },
      { status: 400 },
    )
  }

  const key = `${folder}/${Date.now()}-${filenameForKey}`

  const { bucket } = getR2Env()
  const s3 = getR2Client()

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  )

  return NextResponse.json({ ok: true, publicUrl: buildR2PublicUrl(key), key })
}

