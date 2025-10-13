import mammoth from "mammoth";
import PDFParser from "pdf2json";

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from document');
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error('Failed to extract text from PDF'));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          // Extract text from all pages
          let text = '';
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        text += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
                text += '\n';
              }
            }
          }
          resolve(text.trim());
        } catch (error) {
          reject(new Error('Failed to parse PDF text'));
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error('PDF extraction error:', error);
      reject(new Error('Failed to extract text from PDF'));
    }
  });
}

export function extractTextFromTXT(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8').trim();
  } catch (error) {
    throw new Error('Failed to extract text from TXT file');
  }
}

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop();

  switch (extension) {
    case 'docx':
      return extractTextFromDocx(buffer);
    case 'pdf':
      return extractTextFromPDF(buffer);
    case 'txt':
      return extractTextFromTXT(buffer);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}
