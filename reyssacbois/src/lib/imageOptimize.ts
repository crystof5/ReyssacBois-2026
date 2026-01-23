import "server-only"

import sharp from "sharp"

export type OptimizedImage = {
  body: Buffer
  contentType: string
  extension: string
}

const DEFAULTS = {
  // Objectif: images légères pour pages vitrines, sans casser la qualité.
  maxBytesInput: 20 * 1024 * 1024, // 20MB
  maxDimension: 2560, // px (largeur/hauteur max)
  webpQuality: 82, // 0..100
  webpEffort: 4, // 0..6 (6 = plus lent)
}

function extOfFilename(name: string): string {
  const base = (name ?? "").trim()
  const idx = base.lastIndexOf(".")
  if (idx <= 0) return ""
  return base.slice(idx + 1).toLowerCase()
}

function baseOfFilename(name: string): string {
  const base = (name ?? "").trim()
  const idx = base.lastIndexOf(".")
  if (idx <= 0) return base
  return base.slice(0, idx)
}

function isRasterOptimizable(ext: string, mime: string): boolean {
  const e = ext.toLowerCase()
  const m = mime.toLowerCase()
  if (m === "image/jpeg" || m === "image/png" || m === "image/webp") return true
  return e === "jpg" || e === "jpeg" || e === "png" || e === "webp"
}

/**
 * Convertit une image raster (JPG/JPEG/PNG/WebP) en WebP optimisé + resize.
 * Transparence: l’appelant peut stocker le fichier en `.webp` et renvoyer l’URL normalement.
 */
export async function optimizeUploadToWebp(args: {
  input: Buffer
  filename: string
  mimeType?: string
}): Promise<OptimizedImage> {
  const mimeType = (args.mimeType ?? "").trim()
  const ext = extOfFilename(args.filename)

  if (args.input.byteLength > DEFAULTS.maxBytesInput) {
    throw new Error(
      `Image trop lourde (${Math.round(args.input.byteLength / 1024 / 1024)}MB). Max: ${Math.round(
        DEFAULTS.maxBytesInput / 1024 / 1024,
      )}MB.`,
    )
  }

  if (!isRasterOptimizable(ext, mimeType)) {
    // Non optimisable (ex: svg, gif, pdf...). On renvoie tel quel.
    return {
      body: args.input,
      contentType: mimeType || "application/octet-stream",
      extension: ext ? `.${ext}` : "",
    }
  }

  // Sécurité: limite les images énormes (anti "decompression bomb")
  const out = await sharp(args.input, { failOn: "none", limitInputPixels: 60_000_000 })
    .rotate() // applique l'orientation EXIF puis supprime l'orientation
    .resize({
      width: DEFAULTS.maxDimension,
      height: DEFAULTS.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: DEFAULTS.webpQuality, effort: DEFAULTS.webpEffort })
    .toBuffer()

  return {
    body: out,
    contentType: "image/webp",
    extension: ".webp",
  }
}

export function toWebpFilename(originalSafeName: string): string {
  const base = baseOfFilename(originalSafeName) || "image"
  return `${base}.webp`
}

