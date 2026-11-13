import { formatDateBR } from '../domain/calendarDate';
import { toCsv } from '../domain/csv';
import { REPORT_HEADER } from '../domain/report';
import type { ReportEntry } from '../domain/report';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows: string[][], filename: string): void {
  downloadBlob(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }), filename);
}

export function downloadJson(json: string, filename: string): void {
  downloadBlob(new Blob([json], { type: 'application/json' }), filename);
}

const textCell = (value: string) => ({ value, type: String });

export async function downloadXlsx(entries: ReportEntry[], filename: string): Promise<void> {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const header = REPORT_HEADER.map((value) => ({
    ...textCell(value),
    fontWeight: 'bold' as const,
  }));
  const rows = entries.map((entry) => [
    textCell(formatDateBR(entry.date)),
    textCell(entry.kind),
    textCell(entry.description),
    textCell(entry.category),
    textCell(entry.account),
    textCell(entry.toAccount),
    { value: entry.amountCents / 100, type: Number, format: '#,##0.00' },
    textCell(entry.tags),
  ]);
  await writeExcelFile([header, ...rows]).toFile(filename);
}

export async function downloadPdf(
  title: string,
  rows: string[][],
  totals: string[],
  filename: string,
): Promise<void> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const [head = [], ...body] = rows;
  const pdf = new jsPDF({ orientation: 'landscape' });
  pdf.setFontSize(14);
  pdf.text(title, 14, 16);
  pdf.setFontSize(10);
  pdf.text(totals.join('   '), 14, 24);
  autoTable(pdf, { head: [head], body, startY: 30, styles: { fontSize: 8 } });
  pdf.save(filename);
}
