import { generateContent } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read file content
        let fileContent = '';
        
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            fileContent = await file.text();
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            // For PDF files, we'll extract text as best we can
            // In production, you'd use a proper PDF parser
            fileContent = await file.text();
        } else {
            // For other file types, try to read as text
            fileContent = await file.text();
        }

        // Limit content length to avoid API limits
        const maxContentLength = 15000;
        if (fileContent.length > maxContentLength) {
            fileContent = fileContent.substring(0, maxContentLength) + '...';
        }

        const prompt = `Please provide a comprehensive summary of the following document in markdown format. 
Include key points, main topics, and important details. Structure your response with clear headings and bullet points where appropriate.

Document content:
${fileContent}

Please provide a well-organized summary in markdown format:`;

        const summary = await generateContent(prompt);

        if (!summary) {
            return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
        }

        return NextResponse.json({ summary }, { status: 200 });
    } catch (err) {
        console.error('Summary generation error:', err);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
