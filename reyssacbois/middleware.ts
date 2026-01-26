import { NextResponse, type NextRequest } from "next/server"

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

  // 3) Legacy routes (ancien site) : on ne redirige PAS, on supprime (410 Gone)
  // => Google les retire plus vite qu’une 404 et ça évite la "reconstruction" de l'ancien site.
  const isLegacyPath =
    pathname === "/nos-produits" ||
    pathname === "/materiel" ||
    pathname.startsWith("/materiel/") ||
    pathname === "/categorie" ||
    pathname.startsWith("/categorie/") ||
    pathname === "/item" ||
    pathname.startsWith("/item/")

  if (isLegacyPath) {
    return new NextResponse("Gone", {
      status: 410,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        // Défensif: empêche l'indexation même si Google retente.
        "x-robots-tag": "noindex, nofollow",
        // Cache court pour permettre d'ajuster si besoin.
        "cache-control": "public, max-age=300",
      },
    })
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


