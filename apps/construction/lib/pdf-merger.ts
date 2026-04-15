import { PDFDocument } from "pdf-lib";

export interface PDFFile {
  url: string;
  fileName: string;
}

/**
 * Merge multiple PDF files into a single PDF
 * @param pdfFiles Array of PDF file URLs to merge
 * @returns Merged PDF as Uint8Array
 */
export async function mergePDFs(pdfFiles: PDFFile[]): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of pdfFiles) {
      try {
        // Fetch the PDF from URL
        const response = await fetch(file.url);

        if (!response.ok) {
          console.error(`Failed to fetch PDF: ${file.fileName} from ${file.url}`);
          continue;
        }

        const pdfBytes = await response.arrayBuffer();

        // Load the PDF document
        const pdf = await PDFDocument.load(pdfBytes);

        // Copy all pages from this PDF to the merged PDF
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        // Add each copied page to the merged document
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }
      } catch (error) {
        console.error(`Error processing PDF ${file.fileName}:`, error);
        // Continue with other files even if one fails
        continue;
      }
    }

    // Check if we have any pages
    if (mergedPdf.getPageCount() === 0) {
      throw new Error("No pages were successfully merged");
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    return mergedPdfBytes;
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw new Error("Failed to merge PDF documents");
  }
}

/**
 * Create a cover page for the data book
 */
export async function createCoverPage(
  projectName: string,
  projectNumber: string | null,
  documentCount: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

  const { height } = page.getSize();

  // Add title
  page.drawText("PROJECT DATA BOOK", {
    x: 50,
    y: height - 100,
    size: 32,
  });

  // Add project info
  const projectInfo = projectNumber ? `${projectNumber} - ${projectName}` : projectName;

  page.drawText(projectInfo, {
    x: 50,
    y: height - 150,
    size: 20,
  });

  // Add document count
  page.drawText(`Total Documents: ${documentCount}`, {
    x: 50,
    y: height - 200,
    size: 14,
  });

  // Add generation date
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  page.drawText(`Generated: ${date}`, {
    x: 50,
    y: height - 230,
    size: 12,
  });

  // Add footer
  page.drawText("Electronic Document Management System", {
    x: 50,
    y: 50,
    size: 10,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Merge PDFs with a cover page
 */
export async function mergePDFsWithCover(
  pdfFiles: PDFFile[],
  projectName: string,
  projectNumber: string | null
): Promise<Uint8Array> {
  // Create cover page
  const coverBytes = await createCoverPage(projectName, projectNumber, pdfFiles.length);

  // Create merged document
  const mergedPdf = await PDFDocument.create();

  // Add cover page
  const coverPdf = await PDFDocument.load(coverBytes);
  const [coverPage] = await mergedPdf.copyPages(coverPdf, [0]);
  mergedPdf.addPage(coverPage);

  // Add all document pages
  for (const file of pdfFiles) {
    try {
      const response = await fetch(file.url);
      if (!response.ok) continue;

      const pdfBytes = await response.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    } catch (error) {
      console.error(`Error processing PDF ${file.fileName}:`, error);
      continue;
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  return mergedPdfBytes;
}
