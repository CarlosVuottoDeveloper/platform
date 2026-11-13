import writeExcelFile from 'write-excel-file/browser';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { ReportEntry } from '../domain/report';
import { downloadCsv, downloadJson, downloadPdf, downloadXlsx } from './exportService';

const toFile = jest.fn();
jest.mock('write-excel-file/browser', () => ({
  __esModule: true,
  default: jest.fn(() => ({ toFile })),
}));

const pdfDocument = { setFontSize: jest.fn(), text: jest.fn(), save: jest.fn() };
jest.mock('jspdf', () => ({ jsPDF: jest.fn(() => pdfDocument) }));
jest.mock('jspdf-autotable', () => ({ autoTable: jest.fn() }));

const entry: ReportEntry = {
  date: '2026-03-10',
  kind: 'Despesa',
  description: '=HYPERLINK("http://x")',
  category: 'Alimentação',
  account: 'Nubank',
  toAccount: '',
  amountCents: 123456,
  tags: 'casa',
};

describe('exportService', () => {
  let downloaded: { blob: Blob; filename: string }[];

  beforeEach(() => {
    jest.clearAllMocks();
    downloaded = [];
    let lastBlob: Blob | undefined;
    URL.createObjectURL = jest.fn((blob: Blob) => {
      lastBlob = blob;
      return 'blob:generated';
    });
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(
      this: HTMLAnchorElement,
    ) {
      downloaded.push({ blob: lastBlob as Blob, filename: this.download });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('downloads a CSV file with the rows escaped', async () => {
    downloadCsv([['Descrição'], ['=1;2']], 'relatorio.csv');

    expect(downloaded).toHaveLength(1);
    expect(downloaded[0]?.filename).toBe('relatorio.csv');
    expect(downloaded[0]?.blob.type).toBe('text/csv;charset=utf-8');
    expect(downloaded[0]?.blob.size).toBeGreaterThan(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:generated');
  });

  it('downloads a JSON file', () => {
    downloadJson('{"version":1}', 'financas.json');

    expect(downloaded[0]?.filename).toBe('financas.json');
    expect(downloaded[0]?.blob.type).toBe('application/json');
  });

  it('writes an Excel file with text cells typed as text and the amount as a number', async () => {
    await downloadXlsx([entry], 'relatorio.xlsx');

    const [sheetData] = jest.mocked(writeExcelFile).mock.calls[0] as unknown as [unknown[][]];
    expect(sheetData[0]).toEqual(
      ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Conta destino', 'Valor', 'Tags'].map(
        (value) => ({ value, type: String, fontWeight: 'bold' }),
      ),
    );
    expect(sheetData[1]).toEqual([
      { value: '10/03/2026', type: String },
      { value: 'Despesa', type: String },
      { value: '=HYPERLINK("http://x")', type: String },
      { value: 'Alimentação', type: String },
      { value: 'Nubank', type: String },
      { value: '', type: String },
      { value: 1234.56, type: Number, format: '#,##0.00' },
      { value: 'casa', type: String },
    ]);
    expect(toFile).toHaveBeenCalledWith('relatorio.xlsx');
  });

  it('writes a PDF with a title, the totals and the table', async () => {
    await downloadPdf(
      'Relatório de 01/03/2026 a 31/03/2026',
      [
        ['Data', 'Valor'],
        ['10/03/2026', '1234,56'],
      ],
      ['Receitas: R$ 0,00', 'Despesas: R$ 1.234,56'],
      'relatorio.pdf',
    );

    expect(jsPDF).toHaveBeenCalledWith({ orientation: 'landscape' });
    expect(pdfDocument.text).toHaveBeenCalledWith('Relatório de 01/03/2026 a 31/03/2026', 14, 16);
    expect(pdfDocument.text).toHaveBeenCalledWith(
      'Receitas: R$ 0,00   Despesas: R$ 1.234,56',
      14,
      24,
    );
    expect(autoTable).toHaveBeenCalledWith(
      pdfDocument,
      expect.objectContaining({ head: [['Data', 'Valor']], body: [['10/03/2026', '1234,56']] }),
    );
    expect(pdfDocument.save).toHaveBeenCalledWith('relatorio.pdf');
  });
});
