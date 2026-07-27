import * as XLSX from 'xlsx';

export interface ExcelExportColumn {
  key: string;
  header: string;
  formatter?: (value: any, row: any) => any;
}

export interface ExcelExportOptions {
  filename?: string;
  columns: ExcelExportColumn[];
  data: any[];
  sheetName?: string;
}

export function exportToExcel({ filename = 'export', columns, data, sheetName = 'Sheet1' }: ExcelExportOptions) {
  const formattedData = data.map(row =>
    columns.reduce((acc, col) => {
      const value = row[col.key];
      acc[col.header] = col.formatter ? col.formatter(value, row) : value ?? '-';
      return acc;
    }, {} as Record<string, any>)
  );

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Auto-size columns
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportSelectedToExcel(title: string, columns: ExcelExportColumn[], data: any[]) {
  exportToExcel({
    filename: title.toLowerCase().replace(/\s+/g, '-'),
    columns,
    data,
    sheetName: title
  });
}

// Helper to trigger CSV download (simpler alternative)
export function exportToCSV(filename: string, columns: ExcelExportColumn[], data: any[]) {
  const formattedData = data.map(row =>
    columns.reduce((acc, col) => {
      const value = row[col.key];
      acc[col.header] = col.formatter ? col.formatter(value, row) : (value ?? '-');
      return acc;
    }, {} as Record<string, any>)
  );

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  XLSX.writeFile(workbook, `${filename}.csv`);
}