/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, Header, Footer } from 'docx';
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
        width: 250,
        height: 250,
      },
    } as any);
  } catch (error) {
    console.warn('Logo not found, proceeding without logo:', error);
  }

  // Create header
  const headerParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `${originalTitle.split(".")[0]} - ${sessionData.name}`,
        size: 16,
        color: "666666",
      }),
    ],
    alignment: AlignmentType.RIGHT,
  });

  // Create footer
  const footerParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `${new Date().toLocaleDateString()} | Roll: ${sessionData.roll_number}`,
        size: 16,
        color: "666666",
      }),
    ],
    alignment: AlignmentType.RIGHT,
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1800,    // 1.25 inch for header space
            bottom: 1800,
            left: 1440,   // 1 inch
            right: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [headerParagraph],
        }),
      },
      footers: {
        default: new Footer({
          children: [footerParagraph],
        }),
      },
      children: [
        // Enhanced Title Page
        ...(logoImage ? [
          new Paragraph({
            children: [logoImage],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          })
        ] : []),

        // Main title with better styling
        new Paragraph({
          children: [
            new TextRun({
              text: `${originalTitle.split(".")[0]}`,
              bold: true,
              size: 40,
              color: "1F4E79",
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          border: {
            bottom: {
              color: "1F4E79",
              space: 8,
              style: BorderStyle.SINGLE,
              size: 2,
            },
          },
        }),

        // Subtitle
        new Paragraph({
          children: [
            new TextRun({
              text: "Assignment Solution",
              size: 24,
              color: "4472C4",
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),

        // Student info in a styled box
        new Paragraph({
          children: [
            new TextRun({
              text: `👤 Student: ${sessionData.name}`,
              size: 24,
              bold: true,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
          indent: { left: 720 },
          shading: {
            type: "solid",
            color: "F8F9FA",
          },
          border: {
            left: {
              color: "4472C4",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `🎓 Roll Number: ${sessionData.roll_number}`,
              size: 24,
              bold: true,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
          indent: { left: 720 },
          shading: {
            type: "solid",
            color: "F8F9FA",
          },
          border: {
            left: {
              color: "4472C4",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),
        // Page break
        new Paragraph({
          children: [new PageBreak()],
        }),

        // Solution header with enhanced styling
        new Paragraph({
          children: [
            new TextRun({
              text: "📝 Solution",
              bold: true,
              size: 32,
              color: "1F4E79",
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 },
          shading: {
            type: "solid",
            color: "E8F1FF",
          },
          border: {
            bottom: {
              color: "1F4E79",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 2,
            },
          },
        }),

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
  const fontSize = Math.max(36 - (node.depth || 1) * 3, 20);
  
  // Different colors for different heading levels
  const colors = ["1F4E79", "4472C4", "5B9BD5", "70AD47", "FFC000", "C55A11"];
  const color = colors[Math.min((node.depth || 1) - 1, colors.length - 1)];

  // Add emoji prefixes for different heading levels (common in AI-generated content)
  const emojiPrefixes = ["🔍", "📊", "💡", "⚙️", "📌", "🔸"];
  const emoji = emojiPrefixes[Math.min((node.depth || 1) - 1, emojiPrefixes.length - 1)];

  return new Paragraph({
    children: [
      new TextRun({
        text: `${emoji} ${normalizeText(extractTextFromNode(node))}`,
        bold: true,
        size: fontSize,
        color: color,
      }),
    ],
    heading: level,
    spacing: { before: 400, after: 300 },
    shading: (node.depth || 1) <= 2 ? {
      type: "solid",
      color: "F8F9FA",
    } : undefined,
    border: (node.depth || 1) <= 2 ? {
      bottom: {
        color: color,
        space: 2,
        style: BorderStyle.SINGLE,
        size: 1,
      },
    } : undefined,
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
    spacing: { after: 240 },
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 360 }, // First line indent for paragraphs
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
        size: 22,
        color: "1F4E79"
      }));
      break;
    case 'emphasis':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
        italics: true,
        size: 22,
        color: "4472C4"
      }));
      break;
    case 'inlineCode':
      runs.push(new TextRun({
        text: ` ${node.value || ''} `,
        size: 20,
        font: "Consolas",
        color: "E74C3C",
        shading: {
          type: "solid",
          color: "FDF2F2",
        },
        border: {
          color: "E74C3C",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 1,
        },
      }));
      break;
    case 'link':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
        size: 22,
        color: "0366D6",
        underline: {
          color: "0366D6",
          type: "single",
        },
      }));
      break;
    case 'delete':
      runs.push(new TextRun({
        text: normalizeText(extractTextFromNode(node)),
        size: 22,
        strike: true,
        color: "999999",
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
  const indent = 720 + (depth * 360);
  
  // Different bullet styles for different depths
  const bulletStyles = ["🔹", "▪️", "◦", "▫️"];
  const bulletStyle = bulletStyles[Math.min(depth, bulletStyles.length - 1)];

  if (node.children) {
    let textContent = '';
    const nestedLists: MarkdownNode[] = [];

    for (const child of node.children) {
      if (child.type === 'list') {
        nestedLists.push(child);
      } else {
        textContent += extractTextFromNode(child) + ' ';
      }
    }

    const bullet = ordered ? `${index + 1}.` : bulletStyle;
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ 
          text: `${bullet} `, 
          size: 22, 
          bold: true,
          color: "4472C4"
        }),
        new TextRun({ 
          text: normalizeText(textContent.trim()), 
          size: 22 
        }),
      ],
      spacing: { after: 120 },
      indent: { left: indent, hanging: 360 },
    }));

    for (const nestedList of nestedLists) {
      if (nestedList.children) {
        nestedList.children.forEach((nestedItem, nestedIndex) => {
          const nestedParagraphs = createListItem(nestedItem, nestedIndex, nestedList.ordered || false, depth + 1);
          paragraphs.push(...nestedParagraphs);
        });
      }
    }
  } else {
    const bullet = ordered ? `${index + 1}.` : bulletStyle;
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ 
          text: `${bullet} `, 
          size: 22, 
          bold: true,
          color: "4472C4"
        }),
        new TextRun({ 
          text: normalizeText(extractTextFromNode(node)), 
          size: 22 
        }),
      ],
      spacing: { after: 120 },
      indent: { left: indent, hanging: 360 },
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
                color: "4472C4",
              } : (rowIndex % 2 === 0 ? {
                type: "solid",
                color: "F8F9FA",
              } : undefined),
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
                left: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
                right: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
              },
              margins: {
                top: 200,
                bottom: 200,
                left: 300,
                right: 300,
              },
            }));
          }
        });

        rows.push(new TableRow({
          children: cells,
          height: { value: 700, rule: "atLeast" },
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
      top: 300,
      bottom: 300,
      left: 0,
      right: 0,
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
          text: `💻 ${language.toUpperCase()}\n`,
          size: 18,
          font: "Consolas",
          color: "FFFFFF",
          bold: true,
        })
      ] : []),
      new TextRun({
        text: codeText,
        size: 20,
        font: "Consolas",
        color: "2F3337",
      }),
    ],
    spacing: { before: 300, after: 300 },
    indent: { left: 360, right: 360 },
    shading: {
      type: "solid",
      color: language ? "282C34" : "F8F8F8",
    },
    border: {
      left: {
        color: "4472C4",
        space: 4,
        style: BorderStyle.SINGLE,
        size: 8,
      },
      top: {
        color: "DDDDDD",
        space: 2,
        style: BorderStyle.SINGLE,
        size: 2,
      },
      right: {
        color: "DDDDDD",
        space: 2,
        style: BorderStyle.SINGLE,
        size: 2,
      },
      bottom: {
        color: "DDDDDD",
        space: 2,
        style: BorderStyle.SINGLE,
        size: 2,
      },
    },
  });
}

function createBlockquote(node: MarkdownNode): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "💬 ",
        size: 24,
        color: "4472C4",
      }),
      new TextRun({
        text: `"${normalizeText(extractTextFromNode(node))}"`,
        size: 22,
        italics: true,
        color: "555555",
      }),
    ],
    spacing: { before: 300, after: 300 },
    indent: { left: 720, right: 360 },
    shading: {
      type: "solid",
      color: "F8F9FA",
    },
    border: {
      left: {
        color: "4472C4",
        space: 4,
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
        text: "═══════════════════════════════════════════════════",
        size: 16,
        color: "4472C4",
        bold: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
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

function normalizeText(text: string): string {
  return text
    .replace(/([.!?])([A-Za-z])/g, '$1 $2')
    .replace(/,([A-Za-z])/g, ', $1')
    .replace(/([;:])([A-Za-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}