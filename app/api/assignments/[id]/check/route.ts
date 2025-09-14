import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/connectDB';
import AssignmentSolver from '@/models/AssignmentSolver';
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
    const { id } = await context.params;
    await connectDB();
    // fileId is a string, not ObjectId, as per frontend and solve route
    const assignment = await AssignmentSolver.findOne({
      fileId: id,
      userId: session.user.id
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: assignment._id,
      originalName: assignment.originalName,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      hasSolvedFile: !!assignment.solvedFileId
    });

  } catch (error) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}