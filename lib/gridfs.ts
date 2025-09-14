import { GridFSBucket, MongoClient, Db, ObjectId } from 'mongodb';
import { Readable } from 'stream';

let client: MongoClient | null = null;
let db: Db | null = null;
let bucket: GridFSBucket | null = null;

export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (bucket) return bucket;

  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
  }

  db = client.db();
  bucket = new GridFSBucket(db, { bucketName: 'assignments' });
  
  return bucket;
}

export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getGridFSBucket();
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType }
    });
    
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id as ObjectId));
    
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export async function downloadFromGridFS(fileId: ObjectId): Promise<{
  stream: NodeJS.ReadableStream;
  filename: string;
  contentType: string;
}> {
  const bucket = await getGridFSBucket();
  
  const file = await bucket.find({ _id: fileId }).next();
  if (!file) {
    throw new Error('File not found');
  }
  
  const downloadStream = bucket.openDownloadStream(fileId);
  
  return {
    stream: downloadStream,
    filename: file.filename,
    contentType: file.metadata?.contentType || 'application/octet-stream'
  };
}