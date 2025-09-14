// app/api/authuser/route.js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies();
  const authuser = cookieStore.get('authuser')?.value;
  return NextResponse.json({ authuser });
}