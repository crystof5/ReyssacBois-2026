export type AnalyticsStorageConsent = "granted" | "denied"

export const RB_COOKIE_CONSENT_NAME = "rb_cookie_consent"
export const RB_COOKIE_CONSENT_VERSION = "v1"

function parseConsentCookie(raw: string | null | undefined): AnalyticsStorageConsent | null {
  if (!raw) return null
  const v = raw.trim().toLowerCase()
  if (!v) return null

  // Formats acceptés (simple et évolutif) :
  // - "v1:granted" / "v1:denied"
  // - "granted" / "denied" (tolérance)
  if (v === "granted" || v === "denied") return v
  if (v.startsWith(`${RB_COOKIE_CONSENT_VERSION}:`)) {
    const tail = v.slice(`${RB_COOKIE_CONSENT_VERSION}:`.length)
    if (tail === "granted" || tail === "denied") return tail
  }
  return null
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const parts = document.cookie.split(";")
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=")
    if (k === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

export function readAnalyticsConsent(): AnalyticsStorageConsent | null {
  return parseConsentCookie(getCookieValue(RB_COOKIE_CONSENT_NAME))
}

export function writeAnalyticsConsent(value: AnalyticsStorageConsent, days = 180): void {
  if (typeof document === "undefined") return
  const maxAge = Math.max(0, Math.floor(days * 24 * 60 * 60))
  const isHttps = typeof location !== "undefined" && location.protocol === "https:"
  const cookieValue = encodeURIComponent(`${RB_COOKIE_CONSENT_VERSION}:${value}`)
  document.cookie = [
    `${RB_COOKIE_CONSENT_NAME}=${cookieValue}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

export function dispatchConsentChange(value: AnalyticsStorageConsent): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("rb:cookie-consent", { detail: { analyticsStorage: value } }))
}

export function onConsentChange(
  handler: (value: AnalyticsStorageConsent) => void,
): () => void {
  if (typeof window === "undefined") return () => {}

  const listener = (e: Event) => {
    const detail = (e as CustomEvent).detail as { analyticsStorage?: AnalyticsStorageConsent } | undefined
    const v = detail?.analyticsStorage
    if (v === "granted" || v === "denied") handler(v)
  }
  window.addEventListener("rb:cookie-consent", listener)
  return () => window.removeEventListener("rb:cookie-consent", listener)
}

export function updateGtagConsent(
  measurementId: string | undefined,
  value: AnalyticsStorageConsent,
): void {
  if (typeof window === "undefined") return
  const id = (measurementId ?? "").trim()
  if (!id) return

  // Coupe GA de manière defensive si l'utilisateur refuse.
  ;(window as any)[`ga-disable-${id}`] = value === "denied"

  // Si gtag est déjà chargé, met à jour le consentement.
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
  if (typeof gtag === "function") {
    gtag("consent", "update", { analytics_storage: value })
  }
}

