/**
 * Helpers SEO (URL canonique, sitemap/robots).
 *
 * Priorité:
 * - NEXT_PUBLIC_SITE_URL (recommandé)  ex: https://reyssacbois.fr
 * - SITE_URL (fallback)
 * - VERCEL_URL (auto, sans protocole) ex: reyssacbois.vercel.app
 * - http://localhost:3000 (dev)
 */

const CANONICAL_PRODUCTION_URL = "https://www.reyssacbois.fr";

export function getBaseUrl(): string {
  const explicitRaw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();

  if (explicitRaw) {
    // Certains hébergeurs/UI peuvent ajouter des espaces/retours à la ligne.
    // On ne garde que le premier “token”.
    const explicit = explicitRaw.split(/\s+/)[0]?.trim() ?? "";
    if (!explicit) {
      // fallback plus bas
    } else {
      // Normalise: ajoute https:// si l'utilisateur a mis juste le host.
      if (!/^https?:\/\//i.test(explicit)) return `https://${explicit}`;
      return explicit;
    }
  }

  // Important: sur Vercel, `VERCEL_URL` pointe souvent vers le domaine *.vercel.app (et en preview vers une URL unique).
  // En production, on préfère le domaine canonique (custom domain) pour éviter d'émettre un sitemap avec des URLs "non autorisées".
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_PRODUCTION_URL;
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }

  return "http://localhost:3000";
}

function normalizeCanonicalBaseUrl(u: URL): URL {
  // Canonical choisi: https://www.reyssacbois.fr (aligné avec ton redirect DNS)
  const hostname = u.hostname.toLowerCase();
  if (hostname === "reyssacbois.fr") {
    u.hostname = "www.reyssacbois.fr";
  }
  if (u.hostname.toLowerCase() === "www.reyssacbois.fr") {
    u.protocol = "https:";
  }
  return u;
}

export function getMetadataBaseUrl(): URL {
  // Ne doit JAMAIS throw : sinon toute l'app peut tomber.
  const candidates = [
    getBaseUrl(),
    process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.trim()}`
      : "",
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    try {
      const u = new URL(c);
      return normalizeCanonicalBaseUrl(u);
    } catch {
      // continue
    }
  }

  // Dernier recours (ne devrait jamais arriver)
  return normalizeCanonicalBaseUrl(new URL("http://localhost:3000"));
}

export function absoluteUrl(pathname: string): string {
  const base = getMetadataBaseUrl().toString().replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
