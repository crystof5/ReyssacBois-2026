import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? ""
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Middleware ne s'applique qu'à /admin (matcher en bas).
  // Si Supabase n'est pas configuré, on bloque l'admin (fail closed).
  if (!url || !anonKey) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("error", "supabase_not_configured")
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh la session si besoin
  const { data } = await supabase.auth.getUser()
  const user = data.user

  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith("/admin")

  if (isAdminPath) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const allowed = getAdminEmails()
    if (allowed.length > 0) {
      const email = (user.email ?? "").toLowerCase()
      if (!allowed.includes(email)) {
        // Si connecté mais non admin : on renvoie vers l'accueil
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = "/"
        return NextResponse.redirect(homeUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}


