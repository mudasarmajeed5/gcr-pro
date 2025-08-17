// ./middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url))
  }

  return NextResponse.next()
})

// Optional: configure matcher so it doesn't run on static files or the signin page itself
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth/sign-in).*)",
  ],
}
