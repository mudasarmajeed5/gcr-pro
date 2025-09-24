/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import fs from 'fs';
import path from 'path';

interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
  depth?: number;
  ordered?: boolean;
  checked?: boolean | null;
  lang?: string;
  url?: string;
  title?: string;
  align?: string[];
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
      data: Buffer.from(logoBuffer),
      transformation: {
        width: 300,
        height: 300,
      },
    } as any);
  } catch (error) {
    console.warn('Logo not found, proceeding without logo:', error);
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,    // 1 inch
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
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

async function parseMarkdownToDocxElements(markdown: string): Promise<(Paragraph | Table)[]> {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdown);

  return convertMarkdownNodesToDocx(tree.children as MarkdownNode[]);
}

function convertMarkdownNodesToDocx(nodes: MarkdownNode[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
        elements.push(createHeading(node));
        break;
      case 'paragraph':
        elements.push(createParagraph(node)); 
        break;
      case 'list':
        elements.push(...createList(node));
        break;
      case 'code':
        elements.push(createCodeBlock(node));
        break;
      case 'blockquote':
        elements.push(createBlockquote(node));
        break;
      case 'table':
        elements.push(createTable(node));
        break;
      case 'thematicBreak':
        elements.push(createThematicBreak());
        break;
      case 'html':
        // Skip HTML blocks for now or convert to paragraph
        if (node.value && !node.value.trim().startsWith('<')) {
          elements.push(new Paragraph({
            children: [new TextRun({ text: normalizeText(node.value), size: 22 })],
            spacing: { after: 200 },
          }));
        }
        break;
      default:
        // Handle other node types or convert to paragraph
        if (node.value) {
          elements.push(new Paragraph({
            children: [new TextRun({ text: normalizeText(node.value), size: 22 })],
            spacing: { after: 200 },
          }));
        }
    }
  }

  return elements;
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
        text: normalizeText(extractTextFromNode(node)),
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
    textRuns.push(new TextRun({ text: normalizeText(node.value), size: 22 }));
  }

  return new Paragraph({
    children: textRuns.length > 0 ? textRuns : [new TextRun({ text: "", size: 22 })],
    spacing: { after: 200 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function createTextRuns(node: MarkdownNode): TextRun[] {
  const runs: TextRun[] = [];

  switch (node.type) {
    case 'text':
      runs.push(new TextRun({
        text: normalizeText(node.value || ''),
        size: 22
      }));
      break;
    case 'strong':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
        bold: true,
        size: 22
      }));
      break;
    case 'emphasis':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
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
        shading: {
          type: "solid",
          color: "F6F8FA",
        },
      }));
      break;
    case 'link':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
        size: 22,
        color: "0366D6",
        underline: {},
      }));
      break;
    case 'delete':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
        size: 22,
        strike: true,
        color: "666666",
      }));
      break;
    case 'break':
      runs.push(new TextRun({
        text: "",
        break: 1,
      }));
      break;
    default:
      if (node.children) {
        for (const child of node.children) {
          runs.push(...createTextRuns(child));
        }
      } else if (node.value) {
        runs.push(new TextRun({ text: normalizeText(node.value), size: 22 }));
      }
  }

  return runs;
}

function createList(node: MarkdownNode): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (node.children) {
    node.children.forEach((item, index) => {
      const listParagraphs = createListItem(item, index, node.ordered || false, 0);
      paragraphs.push(...listParagraphs);
    });
  }

  return paragraphs;
}

function createListItem(node: MarkdownNode, index: number, ordered: boolean, depth: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const indent = 720 + (depth * 360); // Increase indent for nested lists

  if (node.children) {
    let textContent = '';
    const nestedLists: MarkdownNode[] = [];

    // Separate text content from nested lists
    for (const child of node.children) {
      if (child.type === 'list') {
        nestedLists.push(child);
      } else {
        textContent += extractTextFromNode(child) + ' ';
      }
    }

    // Create main list item
    const bullet = ordered ? `${index + 1}.` : '•';
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: `${bullet} `, size: 22, bold: true }),
        new TextRun({ text: normalizeText(textContent.trim()), size: 22 }),
      ],
      spacing: { after: 100 },
      indent: { left: indent },
    }));

    // Handle nested lists
    for (const nestedList of nestedLists) {
      if (nestedList.children) {
        nestedList.children.forEach((nestedItem, nestedIndex) => {
          const nestedParagraphs = createListItem(nestedItem, nestedIndex, nestedList.ordered || false, depth + 1);
          paragraphs.push(...nestedParagraphs);
        });
      }
    }
  } else {
    const bullet = ordered ? `${index + 1}.` : '•';
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: `${bullet} `, size: 22, bold: true }),
        new TextRun({ text: normalizeText(extractTextFromNode(node)), size: 22 }),
      ],
      spacing: { after: 100 },
      indent: { left: indent },
    }));
  }

  return paragraphs;
}

function createTable(node: MarkdownNode): Table {
  const rows: TableRow[] = [];

  if (node.children) {
    node.children.forEach((row, rowIndex) => {
      if (row.type === 'tableRow' && row.children) {
        const cells: TableCell[] = [];

        row.children.forEach((cell) => {
          if (cell.type === 'tableCell') {
            const cellRuns: TextRun[] = [];

            if (cell.children) {
              for (const cellChild of cell.children) {
                cellRuns.push(...createTextRuns(cellChild));
              }
            } else if (cell.value) {
              cellRuns.push(new TextRun({ text: normalizeText(cell.value), size: 20 }));
            }

            cells.push(new TableCell({
              children: [
                new Paragraph({
                  children: cellRuns.length > 0 ? cellRuns : [new TextRun({ text: "", size: 20 })],
                  alignment: AlignmentType.LEFT,
                })
              ],
              width: {
                size: 20,
                type: WidthType.PERCENTAGE,
              },
              shading: rowIndex === 0 ? {
                type: "solid",
                color: "F8F9FA",
              } : undefined,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              },
            }));
          }
        });

        rows.push(new TableRow({
          children: cells,
          height: { value: 600, rule: "atLeast" },
        }));
      }
    });
  }

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    margins: {
      top: 200,
      bottom: 200,
      left: 200,
      right: 200,
    },
  });
}

function createCodeBlock(node: MarkdownNode): Paragraph {
  const language = node.lang || '';
  const codeText = node.value || '';

  return new Paragraph({
    children: [
      ...(language ? [
        new TextRun({
          text: `${language.toUpperCase()}\n`,
          size: 16,
          font: "Courier New",
          color: "666666",
          bold: true,
        })
      ] : []),
      new TextRun({
        text: codeText,
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
    border: {
      left: {
        color: "E1E4E8",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
  });
}

function createBlockquote(node: MarkdownNode): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `"${normalizeText(extractTextFromNode(node))}"`,
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
        style: BorderStyle.SINGLE,
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
    spacing: { before: 300, after: 300 },
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

// Helper function to ensure proper spacing after punctuation
function normalizeText(text: string): string {
  return text
    // Add space after sentence-ending punctuation if not already present
    .replace(/([.!?])([A-Za-z])/g, '$1 $2')
    // Add space after comma if not already present
    .replace(/,([A-Za-z])/g, ', $1')
    // Add space after colon/semicolon if not already present
    .replace(/([;:])([A-Za-z])/g, '$1 $2')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up extra whitespace
    .trim();
}