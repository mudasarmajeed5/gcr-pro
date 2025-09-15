// app/api/authuser/route.js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies();
  const authuser = cookieStore.get('authuser')?.value;
  
  // Convert undefined to null for consistent API response
  return NextResponse.json({ 
    authuser: authuser ? parseInt(authuser) : null 
  });
}