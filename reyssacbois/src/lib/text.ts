export function truncateText(input: string, maxLength: number) {
  const text = input.trim()
  if (maxLength <= 0) return ""
  if (text.length <= maxLength) return text

  // Coupe proprement sans casser au milieu d’un mot si possible
  const slice = text.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(" ")
  const base = lastSpace > Math.max(10, maxLength * 0.6) ? slice.slice(0, lastSpace) : slice
  return `${base}…`
}

export function excerpt(text: string, maxChars = 120) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= maxChars) return normalized
  return normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd() + "…"
}


