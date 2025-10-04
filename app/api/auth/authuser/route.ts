// app/api/authuser/route.js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import UserSettings from '@/models/UserSettings'
import { connectDB } from '@/lib/connectDB'
import { auth } from '@/auth'

export async function GET() {
  await connectDB()
  const session = await auth()
  const userId = session?.user?.id
  const cookieStore = await cookies()
  const authuser = cookieStore.get('authuser')?.value

  let updatedUser

  if (authuser) {
    // ✅ First login (or when cookie is available) → persist it
    updatedUser = await UserSettings.findOneAndUpdate(
      { userId },
      { authUserId: parseInt(authuser) },
      { new: true, upsert: true }
    )
  } else {
    updatedUser = await UserSettings.findOne({ userId })
  }

  if (!updatedUser) {
    return NextResponse.json(
      { error: 'User settings not found' },
      { status: 404 }
    )
  }

  const themeId = updatedUser.themeId ?? 'neutral'

  const res = NextResponse.json({
    authUserId: updatedUser.authUserId ?? null,
    themeId,
  })

  // set a cookie so the theme is available on subsequent requests (not httpOnly so client can read if needed)
  try {
    res.cookies.set('themeId', String(themeId), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    })
  } catch (e) {
    // ignore if cookie can't be set for some reason
    console.error('Unable to set themeId cookie', e)
  }

  return res
}
