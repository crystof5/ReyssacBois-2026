import { NextResponse, type NextRequest } from "next/server"
import { getLegacyRedirect } from "@/lib/legacyRedirects"

const ADMIN_SESSION_COOKIE = "rb_admin_session"

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // 0) Canonical scheme (prod): force https sur le domaine public (évite http vs https en doublon)
  const xfProto = (request.headers.get("x-forwarded-proto") ?? "").toLowerCase()
  const hostname0 = url.hostname.toLowerCase()
  const isPublicDomain = hostname0 === "reyssacbois.fr" || hostname0 === "www.reyssacbois.fr"
  if (isPublicDomain && xfProto === "http") {
    url.protocol = "https:"
    return NextResponse.redirect(url, 308)
  }

  // 1) Canonical host: tu rediriges déjà le domaine apex vers www côté DNS,
  // donc on aligne l’app : reyssacbois.fr -> www.reyssacbois.fr (évite les doublons d’indexation).
  const hostname = url.hostname.toLowerCase()
  if (hostname === "reyssacbois.fr") {
    url.hostname = "www.reyssacbois.fr"
    return NextResponse.redirect(url, 308)
  }

  // 2) Canonical path: supprime le trailing slash (sauf racine)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    url.pathname = pathname.slice(0, -1)
    return NextResponse.redirect(url, 308)
  }

  // 3) Legacy routes (ancien site) : 301 vers l'équivalent actuel pour conserver l'historique SEO.
  const legacyTarget = getLegacyRedirect(pathname)
  if (legacyTarget) {
    url.pathname = legacyTarget
    url.search = ""
    return NextResponse.redirect(url, 301)
  }

  const isAdminPath = pathname.startsWith("/admin")

  if (isAdminPath) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!token) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // On applique les redirects legacy + canonicalisation sur tout le site,
  // et la protection d'admin reste conditionnelle (isAdminPath).
  matcher: ["/:path*"],
}


