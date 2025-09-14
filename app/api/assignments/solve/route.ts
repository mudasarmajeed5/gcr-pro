import { NextRequest, NextResponse } from 'next/server';
import { uploadToGridFS } from '@/lib/gridfs';
import { extractTextFromDocx, createSolvedDocument } from '@/utils/documentUtils';
import { auth } from '@/auth';
import { connectDB } from '@/lib/connectDB';
import AssignmentSolver from '@/models/AssignmentSolver';

async function callGeminiAPI(text: string): Promise<string> {
  const prompt = `Please provide a comprehensive solution to the following assignment. Be thorough, accurate, and well-structured in your response:\n\n${text}`;


  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY as string,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API error:", errText);
    throw new Error("Gemini API call failed");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileId = formData.get('fileId') as string | null;

    if (!file || !fileId) {
      return NextResponse.json({ error: 'No file or fileId uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text
    const extractedText = await extractTextFromDocx(buffer);

    // Solve with Gemini
    const solution = await callGeminiAPI(extractedText);

    // Create solved document
    const solvedDocBuffer = await createSolvedDocument(file.name, solution);

    // Upload solved document to GridFS
    const solvedFileId = await uploadToGridFS(
      solvedDocBuffer,
      `solved_${file.name}`,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    // Store assignment metadata in DB (one per user per fileId)
    await connectDB();
    const assignmentMeta = await AssignmentSolver.findOneAndUpdate(
      { userId: session.user.id, fileId },
      {
        userId: session.user.id,
        fileId,
        originalName: file.name,
        solvedFileId,
        status: 'solved',
        solvedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Return the solved file as a download response
    return new NextResponse(solvedDocBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="solved_${file.name}"`,
        'x-solved-file-id': solvedFileId.toString(),
        'x-assignment-id': assignmentMeta._id.toString(),
      },
    });
  } catch (error) {
    console.error('Solve error:', error);
    return NextResponse.json({ error: 'Solving failed' }, { status: 500 });
  }
}
