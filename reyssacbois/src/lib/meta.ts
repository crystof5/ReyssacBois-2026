export function buildDescription(input: string | null | undefined, fallback: string): string {
  const raw = (input ?? "").trim()
  const base = raw || fallback
  // Petit nettoyage + coupe pour rester “safe” côté SERP
  const normalized = base.replace(/\s+/g, " ").trim()
  return normalized.length > 160 ? `${normalized.slice(0, 157).trimEnd()}…` : normalized
}

