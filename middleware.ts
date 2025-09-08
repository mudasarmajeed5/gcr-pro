import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|icon-192x192.png|sign-in).*)",
  ],
}