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

  return NextResponse.json({
    authUserId: updatedUser.authUserId ?? null,
  })
}
