import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Intercept Google OAuth callback to capture authuser (GET requests only)
  if (pathname === "/api/auth/callback/google" && req.method === "GET") {
    const authuser = searchParams.get("authuser")
    if (authuser) {
      const response = NextResponse.next()
      response.cookies.set("authuser", authuser, { httpOnly: true });
      return response
    }
  }

  // Skip middleware for other auth routes to avoid breaking NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Root path allows both authenticated and unauthenticated users
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Allow access to sign-in page for everyone
  if (pathname === "/sign-in") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // For all other pages, require authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest|icon-192x192.png|icon-512x512.png|sign-in).*)",
  ],
}