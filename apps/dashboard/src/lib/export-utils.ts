import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportData {
  [key: string]: string | number | null | undefined;
}

/**
 * Export data to PDF
 */
export function exportToPDF(
  data: ExportData[],
  columns: ExportColumn[],
  options: {
    title: string;
    filename?: string;
    orientation?: "portrait" | "landscape";
    metadata?: { label: string; value: string }[];
  }
) {
  const doc = new jsPDF({
    orientation: options.orientation || "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFontSize(18);
  doc.text(options.title, 14, 20);

  // Add metadata if provided
  if (options.metadata && options.metadata.length > 0) {
    doc.setFontSize(10);
    let yPos = 30;
    options.metadata.forEach((meta) => {
      doc.text(`${meta.label}: ${meta.value}`, 14, yPos);
      yPos += 6;
    });
  }

  // Prepare table data
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      return value !== null && value !== undefined ? String(value) : "";
    })
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: options.metadata ? 30 + options.metadata.length * 6 + 5 : 30,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [26, 29, 26],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Add footer with date
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Download
  const filename = options.filename || `${options.title.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}

/**
 * Export data to Excel
 */
export function exportToExcel(
  data: ExportData[],
  columns: ExportColumn[],
  options: {
    title: string;
    filename?: string;
    sheetName?: string;
  }
) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data with headers
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      return value !== null && value !== undefined ? value : "";
    })
  );

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  ws["!cols"] = columns.map((col) => ({
    wch: col.width || 15,
  }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, options.sheetName || "Data");

  // Download
  const filename = options.filename || `${options.title.replace(/\s+/g, "_")}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export current page content to PDF (for reports/previews)
 */
export function exportPageToPDF(options: {
  title: string;
  filename?: string;
  elementId?: string;
}) {
  const element = options.elementId
    ? document.getElementById(options.elementId)
    : document.body;

  if (!element) {
    console.error("Element not found for PDF export");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFontSize(18);
  doc.text(options.title, 14, 20);

  // Add content (simplified - for complex layouts, use html2canvas)
  doc.setFontSize(10);
  const text = element.innerText || element.textContent || "";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 14, 30);

  // Download
  const filename = options.filename || `${options.title.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
