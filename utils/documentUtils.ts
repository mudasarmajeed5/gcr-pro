import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Table, TableRow, TableCell, WidthType } from 'docx';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import fs from 'fs';
import path from 'path';
import mammoth from "mammoth"
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
  solvedContent: string,
  sessionData: {
    name: string;
    roll_number: string;
  }
): Promise<Buffer> {
  // Parse markdown content
  const parsedMarkdown = await parseMarkdownToDocxElements(solvedContent);

  // Load logo image
  let logoImage: ImageRun | null = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'air-logo.png');
    const logoBuffer = fs.readFileSync(logoPath);

    logoImage = new ImageRun({
      data: logoBuffer,
      transformation: {
        width: 300,
        height: 300,
      },
    });
  } catch (error) {
    console.warn('Logo not found, proceeding without logo:', error);
  }

  const doc = new Document({
    sections: [{
      children: [
        // Title Page
        ...(logoImage ? [
          new Paragraph({
            children: [logoImage],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        ] : []),

        new Paragraph({
          children: [
            new TextRun({
              text: `${originalTitle.split(".")[0]}`,
              bold: true,
              size: 32,
              color: "2F5496",
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),


        new Paragraph({
          children: [
            new TextRun({
              text: `Name: ${sessionData.name}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `Roll Number: ${sessionData.roll_number}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

  
        // Page break
        new Paragraph({
          children: [new PageBreak()],
        }),

        // Solution header
        new Paragraph({
          children: [
            new TextRun({
              text: "Solution",
              bold: true,
              size: 28,
              color: "2F5496",
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
        }),

        // Add parsed markdown content
        ...parsedMarkdown,
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

async function parseMarkdownToDocxElements(markdown: string): Promise<Paragraph[]> {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdown);

  return convertMarkdownNodesToDocx(tree.children as MarkdownNode[]);
}

function convertMarkdownNodesToDocx(nodes: MarkdownNode[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
        paragraphs.push(createHeading(node));
        break;
      case 'paragraph':
        paragraphs.push(createParagraph(node));
        break;
      case 'list':
        paragraphs.push(...createList(node));
        break;
      case 'code':
        paragraphs.push(createCodeBlock(node));
        break;
      case 'blockquote':
        paragraphs.push(createBlockquote(node));
        break;
      case 'thematicBreak':
        paragraphs.push(createThematicBreak());
        break;
      default:
        // Handle other node types or convert to paragraph
        if (node.value) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: node.value, size: 22 })],
            spacing: { after: 200 },
          }));
        }
    }
  }

  return paragraphs;
}

function createHeading(node: MarkdownNode): Paragraph {
  const headingLevels = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4,
    HeadingLevel.HEADING_5,
    HeadingLevel.HEADING_6,
  ];

  const level = headingLevels[(node.depth || 1) - 1] || HeadingLevel.HEADING_6;
  const fontSize = Math.max(32 - (node.depth || 1) * 2, 20);

  return new Paragraph({
    children: [
      new TextRun({
        text: extractTextFromNode(node),
        bold: true,
        size: fontSize,
        color: "2F5496",
      }),
    ],
    heading: level,
    spacing: { before: 300, after: 200 },
  });
}

function createParagraph(node: MarkdownNode): Paragraph {
  const textRuns: TextRun[] = [];

  if (node.children) {
    for (const child of node.children) {
      textRuns.push(...createTextRuns(child));
    }
  } else if (node.value) {
    textRuns.push(new TextRun({ text: node.value, size: 22 }));
  }

  return new Paragraph({
    children: textRuns.length > 0 ? textRuns : [new TextRun({ text: "", size: 22 })],
    spacing: { after: 200 },
  });
}

function createTextRuns(node: MarkdownNode): TextRun[] {
  const runs: TextRun[] = [];

  switch (node.type) {
    case 'text':
      runs.push(new TextRun({
        text: node.value || '',
        size: 22
      }));
      break;
    case 'strong':
      runs.push(new TextRun({
        text: extractTextFromNode(node),
        bold: true,
        size: 22
      }));
      break;
    case 'emphasis':
      runs.push(new TextRun({
        text: extractTextFromNode(node),
        italics: true,
        size: 22
      }));
      break;
    case 'inlineCode':
      runs.push(new TextRun({
        text: node.value || '',
        size: 20,
        font: "Courier New",
        color: "D73A49",
      }));
      break;
    case 'link':
      runs.push(new TextRun({
        text: extractTextFromNode(node),
        size: 22,
        color: "0366D6",
        underline: {},
      }));
      break;
    default:
      if (node.children) {
        for (const child of node.children) {
          runs.push(...createTextRuns(child));
        }
      } else if (node.value) {
        runs.push(new TextRun({ text: node.value, size: 22 }));
      }
  }

  return runs;
}

function createList(node: MarkdownNode): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (node.children) {
    node.children.forEach((item, index) => {
      const bullet = node.ordered ? `${index + 1}.` : '•';
      const text = extractTextFromNode(item);

      paragraphs.push(new Paragraph({
        children: [
          new TextRun({ text: `${bullet} `, size: 22, bold: true }),
          new TextRun({ text: text, size: 22 }),
        ],
        spacing: { after: 100 },
        indent: { left: 720 }, // Indent list items
      }));
    });
  }

  return paragraphs;
}

function createCodeBlock(node: MarkdownNode): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: node.value || '',
        size: 20,
        font: "Courier New",
        color: "24292E",
      }),
    ],
    spacing: { before: 200, after: 200 },
    indent: { left: 720 },
    shading: {
      type: "solid",
      color: "F6F8FA",
    },
  });
}

function createBlockquote(node: MarkdownNode): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: extractTextFromNode(node),
        size: 22,
        italics: true,
        color: "6A737D",
      }),
    ],
    spacing: { before: 200, after: 200 },
    indent: { left: 720 },
    border: {
      left: {
        color: "DFE2E5",
        space: 1,
        style: "single",
        size: 6,
      },
    },
  });
}

function createThematicBreak(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "_______________________________________________",
        size: 14,
        color: "E1E4E8",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
  });
}

function extractTextFromNode(node: MarkdownNode): string {
  if (node.value) {
    return node.value;
  }

  if (node.children) {
    return node.children
      .map(child => extractTextFromNode(child))
      .join('');
  }

  return '';
}