import { generateContent } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, professor } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Extract user info
    const email = session.user.email;
    const name = session.user.name || '';
    const emailPrefix = email.split('@')[0];
    const rollNo = /^\d/.test(emailPrefix) ? emailPrefix : '';

    // Enhanced prompt with user context
    const enhancedPrompt = `Complete this email draft professionally don't write the subject. Keep all user information exactly as provided. Make it formal and polite.
    User Context:
    - Professor: ${professor}
    - Name: ${name}
    - Roll Number: ${rollNo}
    User's draft: "${prompt}"`;
    const text = await generateContent(enhancedPrompt);

    return NextResponse.json({ text }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}