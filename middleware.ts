import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Root path allows both authenticated and unauthenticated users
  // Component will handle conditional rendering based on session
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Allow access to sign-in page for everyone
  if (pathname === "/sign-in") {
    // Optionally redirect authenticated users away from sign-in
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
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|manifest|icon-192x192.png|icon-512x512.png|sign-in).*)",
  ],
}