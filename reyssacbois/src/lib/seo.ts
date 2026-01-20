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
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim()

  if (explicit) {
    // Normalise: ajoute https:// si l'utilisateur a mis juste le host.
    if (!/^https?:\/\//i.test(explicit)) return `https://${explicit}`
    return explicit
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`
  }

  return "http://localhost:3000"
}

export function absoluteUrl(pathname: string): string {
  const base = getBaseUrl().replace(/\/+$/, "")
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${base}${path}`
}

