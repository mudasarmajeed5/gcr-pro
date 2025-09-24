import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/connectDB';
import AssignmentSolver from '@/models/AssignmentSolver';
import { uploadToGridFS } from '@/lib/gridfs';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.docx')) {
            return NextResponse.json({ error: 'Only .docx files are allowed' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to GridFS
        const fileId = await uploadToGridFS(
            buffer,
            file.name,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        // Save assignment record
        await connectDB();
        const assignment = new AssignmentSolver({
            userId: session.user.id,
            fileId,
            originalName: file.name,
            status: 'pending'
        });

        await assignment.save();

        return NextResponse.json({
            id: assignment._id,
            originalName: assignment.originalName,
            status: assignment.status,
            createdAt: assignment.createdAt
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}