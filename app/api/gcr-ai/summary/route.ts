import { generateContent } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Allowed file types for text extraction
const ALLOWED_TEXT_TYPES = [
    'text/plain',
    'text/markdown',
    'text/csv',
];

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv'];

function isTextFile(file: File): boolean {
    return ALLOWED_TEXT_TYPES.includes(file.type) ||
        ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

function sanitizeContent(content: string): string {
    // Remove potential prompt injection patterns
    // Remove instructions that could manipulate the AI
    return content
        .replace(/ignore (all )?(previous|above) (instructions|prompts)/gi, '[REMOVED]')
        .replace(/disregard (all )?(previous|above)/gi, '[REMOVED]')
        .replace(/you are now/gi, '[REMOVED]')
        .replace(/new instructions:/gi, '[REMOVED]')
        .substring(0, 15000); // Limit length
}

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

        // Check if file type is supported for text extraction
        if (!isTextFile(file)) {
            return NextResponse.json({ 
                error: 'Unsupported file type. Please upload a text file (.txt, .md, .csv)' 
            }, { status: 400 });
        }

        // Read file content
        const rawContent = await file.text();
        
        if (!rawContent || rawContent.trim().length === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 });
        }

        // Sanitize content to prevent prompt injection
        const fileContent = sanitizeContent(rawContent);

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
