import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from document');
  }
}

export async function createSolvedDocument(
  originalTitle: string,
  solvedContent: string
): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      children: [
        // Cover Page
        new Paragraph({
          children: [
            new TextRun({
              text: "AI Assignment Solution",
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Original Assignment: ${originalTitle}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              italics: true,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),
        
        // Page break equivalent
        new Paragraph({
          children: [new TextRun({ text: "", break: 1 })],
          pageBreakBefore: true,
        }),
        
        // Solution Content
        new Paragraph({
          children: [
            new TextRun({
              text: "Solution",
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
        }),
        
        // Split content into paragraphs
        ...solvedContent.split('\n\n').map(paragraph => 
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph.trim(),
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          })
        ),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}