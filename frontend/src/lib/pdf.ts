/**
 * Minimal, dependency-free PDF generator.
 *
 * Builds a valid multi-page PDF (base14 Helvetica fonts only, no external
 * libraries or fonts required) containing a title, one or more simple
 * tables, and optional summary lines — then triggers a browser download.
 * Used for every "Download" action across the app so exports are always
 * a real .pdf file.
 */

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN_X = 40;
const TOP_Y = 758;
const BOTTOM_Y = 46;
const LINE_HEIGHT = 15;
const HEADER_FONT_SIZE = 8.5;
const ROW_FONT_SIZE = 8.5;
const MAX_CELL_CHARS = 40;

function sanitize(value: unknown): string {
  let s = String(value ?? "—");
  // Standard PDF Type1/Helvetica only supports WinAnsi (Latin-1-ish) glyphs.
  s = s
    .replace(/₹/g, "Rs. ")
    .replace(/→/g, "->")
    .replace(/…/g, "...")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
  // Strip anything still outside Latin-1 so the PDF never renders garbage.
  s = s.replace(/[^\u0000-\u00FF]/g, "?");
  if (s.length > MAX_CELL_CHARS) s = `${s.slice(0, MAX_CELL_CHARS - 1)}…`.replace(/[^\u0000-\u00FF]/g, ".");
  return s;
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export interface PdfSection {
  heading?: string;
  columns?: string[];
  columnWidths?: number[];
  rows: Array<Record<string, unknown>>;
  summary?: string[];
}

export interface PdfExportOptions {
  subtitle?: string;
  summary?: string[];
  columns?: string[];
  columnWidths?: number[];
}

function colPositions(columns: string[], columnWidths?: number[]) {
  const weights = columnWidths && columnWidths.length === columns.length ? columnWidths : columns.map((c) => Math.max(4, c.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const usableWidth = PAGE_WIDTH - MARGIN_X * 2;
  const colX: number[] = [];
  let acc = MARGIN_X;
  for (const w of weights) {
    colX.push(acc);
    acc += (w / totalWeight) * usableWidth;
  }
  return colX;
}

function renderPDF(title: string, sections: PdfSection[], topSubtitle?: string): string {
  const generatedOn = new Date().toLocaleDateString("en-GB");

  type PageChunk = {
    heading?: string;
    columns: string[];
    colX: number[];
    rows: string[][];
    isFirstChunkOfSection: boolean;
    isLastChunkOfSection: boolean;
    summary?: string[];
  };
  const pageChunks: PageChunk[][] = [[]];
  let currentPage = pageChunks[0];
  let usedOnPage = topSubtitle ? 3 : 1; // reserve space under the title on page 1
  const pageBudget = Math.floor((TOP_Y - 40 - BOTTOM_Y) / LINE_HEIGHT);

  sections.forEach((section) => {
    const columns = section.columns?.length ? section.columns : section.rows.length ? Object.keys(section.rows[0]) : ["Data"];
    const colX = colPositions(columns, section.columnWidths);
    const tableRows: string[][] = section.rows.length ? section.rows.map((row) => columns.map((col) => sanitize(row[col]))) : [];
    const rowCount = Math.max(1, section.rows.length);

    const headingCost = (section.heading ? 2 : 0) + 2;
    let remaining = rowCount;
    let first = true;
    while (remaining > 0) {
      const availableLines = pageBudget - usedOnPage - headingCost;
      if (availableLines < 3 && usedOnPage > 0) {
        currentPage = [];
        pageChunks.push(currentPage);
        usedOnPage = 0;
        continue;
      }
      const take = Math.min(Math.max(1, availableLines), remaining);
      const chunkRows = section.rows.length ? tableRows.slice(rowCount - remaining, rowCount - remaining + take) : [];
      const isLast = take === remaining;
      currentPage.push({
        heading: section.heading,
        columns,
        colX,
        rows: chunkRows,
        isFirstChunkOfSection: first,
        isLastChunkOfSection: isLast,
        summary: isLast ? section.summary : undefined,
      });
      usedOnPage += headingCost + take + (isLast && section.summary?.length ? section.summary.length + 2 : 0) + 2;
      remaining -= take;
      first = false;
      if (remaining > 0) {
        currentPage = [];
        pageChunks.push(currentPage);
        usedOnPage = 0;
      }
    }
  });

  const objects: string[] = [];
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  let nextId = 3;
  for (let p = 0; p < pageChunks.length; p++) {
    pageIds.push(nextId++);
    contentIds.push(nextId++);
  }
  const fontRegularId = nextId++;
  const fontBoldId = nextId++;

  pageChunks.forEach((chunks, pIdx) => {
    let y = TOP_Y;
    const lines: string[] = [];
    if (pIdx === 0) {
      lines.push(`BT /F2 15 Tf ${MARGIN_X} ${y} Td (${escapePdfText(sanitize(title))}) Tj ET`);
      y -= 18;
      if (topSubtitle) {
        lines.push(`BT /F1 8.5 Tf ${MARGIN_X} ${y} Td (${escapePdfText(sanitize(topSubtitle))}) Tj ET`);
        y -= 16;
      }
      y -= 4;
    }
    lines.push(`BT /F1 7.5 Tf ${PAGE_WIDTH - MARGIN_X - 130} ${TOP_Y} Td (Generated ${generatedOn}) Tj ET`);
    if (pageChunks.length > 1) {
      lines.push(`BT /F1 7.5 Tf ${PAGE_WIDTH - MARGIN_X - 130} ${TOP_Y - 11} Td (Page ${pIdx + 1} of ${pageChunks.length}) Tj ET`);
    }

    chunks.forEach((chunk) => {
      if (chunk.heading && chunk.isFirstChunkOfSection) {
        lines.push(`BT /F2 11 Tf ${MARGIN_X} ${y} Td (${escapePdfText(sanitize(chunk.heading))}) Tj ET`);
        y -= 18;
      }
      chunk.columns.forEach((col, ci) => {
        lines.push(`BT /F2 ${HEADER_FONT_SIZE} Tf 1 0 0 1 ${chunk.colX[ci].toFixed(2)} ${y} Tm (${escapePdfText(sanitize(col))}) Tj ET`);
      });
      y -= 5;
      lines.push(`${MARGIN_X} ${y.toFixed(2)} m ${PAGE_WIDTH - MARGIN_X} ${y.toFixed(2)} l S`);
      y -= LINE_HEIGHT - 3;

      if (!chunk.rows.length) {
        lines.push(`BT /F1 ${ROW_FONT_SIZE} Tf ${MARGIN_X} ${y} Td (No records for this export.) Tj ET`);
        y -= LINE_HEIGHT;
      } else {
        chunk.rows.forEach((row) => {
          row.forEach((cell, ci) => {
            lines.push(`BT /F1 ${ROW_FONT_SIZE} Tf 1 0 0 1 ${chunk.colX[ci].toFixed(2)} ${y} Tm (${escapePdfText(cell)}) Tj ET`);
          });
          y -= LINE_HEIGHT;
        });
      }

      if (chunk.isLastChunkOfSection && chunk.summary?.length) {
        y -= 6;
        lines.push(`${MARGIN_X} ${(y + 6).toFixed(2)} m ${PAGE_WIDTH - MARGIN_X} ${(y + 6).toFixed(2)} l S`);
        y -= 10;
        chunk.summary.forEach((line) => {
          lines.push(`BT /F2 9 Tf ${MARGIN_X} ${y} Td (${escapePdfText(sanitize(line))}) Tj ET`);
          y -= 14;
        });
      }
      y -= 10;
    });

    const content = lines.join("\n") + "\n";
    objects[contentIds[pIdx] - 1] = `${contentIds[pIdx]} 0 obj << /Length ${content.length} >> stream\n${content}endstream endobj\n`;
    objects[pageIds[pIdx] - 1] = `${pageIds[pIdx]} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentIds[pIdx]} 0 R >> endobj\n`;
  });

  objects[0] = `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`;
  objects[1] = `2 0 obj << /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >> endobj\n`;
  objects[fontRegularId - 1] = `${fontRegularId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n`;
  objects[fontBoldId - 1] = `${fontBoldId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += objects[i];
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

function triggerDownload(filename: string, pdf: string) {
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/** Single-table PDF export — used by most "Download" buttons. */
export function downloadPDF(
  filename: string,
  title: string,
  rows: Array<Record<string, unknown>>,
  options: PdfExportOptions = {}
) {
  const pdf = renderPDF(
    title,
    [{ columns: options.columns, columnWidths: options.columnWidths, rows, summary: options.summary }],
    options.subtitle
  );
  triggerDownload(filename, pdf);
}

/** Multi-section PDF export (e.g. "Download all" combining clients + orders). */
export function downloadPDFReport(filename: string, title: string, sections: PdfSection[], subtitle?: string) {
  const pdf = renderPDF(title, sections, subtitle);
  triggerDownload(filename, pdf);
}
