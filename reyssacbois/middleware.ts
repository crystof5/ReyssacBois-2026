import { NextResponse, type NextRequest } from "next/server"

const ADMIN_SESSION_COOKIE = "rb_admin_session"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
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
  matcher: ["/admin/:path*"],
}


