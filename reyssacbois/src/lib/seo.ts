/**
 * Helpers SEO (URL canonique, sitemap/robots).
 *
 * Priorité:
 * - NEXT_PUBLIC_SITE_URL (recommandé)  ex: https://reyssacbois.fr
 * - SITE_URL (fallback)
 * - VERCEL_URL (auto, sans protocole) ex: reyssacbois.vercel.app
 * - http://localhost:3000 (dev)
 */
export function getBaseUrl(): string {
  const explicitRaw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim()

  if (explicitRaw) {
    // Certains hébergeurs/UI peuvent ajouter des espaces/retours à la ligne.
    // On ne garde que le premier “token”.
    const explicit = explicitRaw.split(/\s+/)[0]?.trim() ?? ""
    if (!explicit) {
      // fallback plus bas
    } else {
    // Normalise: ajoute https:// si l'utilisateur a mis juste le host.
      if (!/^https?:\/\//i.test(explicit)) return `https://${explicit}`
      return explicit
    }
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`
  }

  return "http://localhost:3000"
}

export function getMetadataBaseUrl(): URL {
  // Ne doit JAMAIS throw : sinon toute l'app peut tomber.
  const candidates = [
    getBaseUrl(),
    process.env.VERCEL_URL?.trim() ? `https://${process.env.VERCEL_URL.trim()}` : "",
    "http://localhost:3000",
  ].filter(Boolean) as string[]

  for (const c of candidates) {
    try {
      return new URL(c)
    } catch {
      // continue
    }
  }

  // Dernier recours (ne devrait jamais arriver)
  return new URL("http://localhost:3000")
}

export function absoluteUrl(pathname: string): string {
  const base = getMetadataBaseUrl().toString().replace(/\/+$/, "")
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${base}${path}`
}

