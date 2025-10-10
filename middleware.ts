import { NextResponse, type NextRequest } from "next/server"

// Lightweight middleware that avoids initializing NextAuth on every request.
// It infers authentication from the presence of NextAuth session cookies
// (common names) and handles only small, fast operations.

const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
]

function hasSessionCookie(req: NextRequest) {
  try {
    for (const name of SESSION_COOKIE_NAMES) {
      const c = req.cookies.get(name)
      if (c && c.value) return true
    }
  } catch {
    // ignore
  }
  return false
}

export default function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // Intercept Google OAuth callback to capture authuser (GET requests only)
  if (pathname === "/api/auth/callback/google" && req.method === "GET") {
    const authuser = searchParams.get("authuser")
    if (authuser) {
      const response = NextResponse.next()
      // set a small cookie to preserve authuser across the flow
      response.cookies.set("authuser", authuser, { httpOnly: true })
      return response
    }
  }

  // Skip middleware for other auth routes to avoid interfering with NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Root path allows both authenticated and unauthenticated users
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Allow access to sign-in page for everyone
  if (pathname === "/sign-in") {
    if (hasSessionCookie(req)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // For all other pages, require authentication (based on session cookie)
  if (!hasSessionCookie(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Only run middleware for application pages (exclude API routes, Next.js assets, public icons, and the sign-in page)
  matcher: [
    "/((?!_next/static|_next/image|_next/font|api/|favicon.ico|manifest.json|manifest|icon-192x192.png|icon-512x512.png|sign-in).*)",
  ],
}