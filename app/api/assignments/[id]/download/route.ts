import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/connectDB';
import AssignmentSolver from '@/models/AssignmentSolver';
import { downloadFromGridFS } from '@/lib/gridfs';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Await params and convert to ObjectId if needed
    const { id } = await context.params;
    let assignmentId = id;

    const assignment = await AssignmentSolver.findOne({
      fileId: assignmentId,
      userId: session.user.id
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (!assignment.solvedFileId) {
      return NextResponse.json({ error: 'Solved file not available' }, { status: 400 });
    }

    const { stream, filename, contentType } = await downloadFromGridFS(assignment.solvedFileId);

    // Convert stream to buffer for Response
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(Buffer.from(chunk));
      }
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
