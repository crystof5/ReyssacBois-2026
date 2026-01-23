import "server-only"

function normalizeUrl(raw: string | undefined): string | null {
  const v = (raw ?? "").trim()
  if (!v) return null
  // tolérance: si l’utilisateur met juste le host, on force https
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const u = new URL(url)
    // garde-fou: uniquement http/https
    if (u.protocol !== "http:" && u.protocol !== "https:") return null
    return u.toString()
  } catch {
    return null
  }
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.6c0-.8.2-1.4 1.4-1.4h1.4V5.8c-.2 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.7v1.9H8.5V14h2.2v7h2.8Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17.2 6.8h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function SocialLinks({
  className = "",
}: {
  className?: string
}) {
  const facebook = normalizeUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL)
  const instagram = normalizeUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL)

  if (!facebook && !instagram) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {facebook && (
        <a
          href={facebook}
          target="_blank"
          rel="me noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/70 text-gray-700 shadow-sm ring-1 ring-black/5 hover:bg-white hover:text-gray-900"
          aria-label="Facebook Reyssac Bois"
          title="Facebook"
        >
          <FacebookIcon />
        </a>
      )}
      {instagram && (
        <a
          href={instagram}
          target="_blank"
          rel="me noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/70 text-gray-700 shadow-sm ring-1 ring-black/5 hover:bg-white hover:text-gray-900"
          aria-label="Instagram Reyssac Bois"
          title="Instagram"
        >
          <InstagramIcon />
        </a>
      )}
    </div>
  )
}

