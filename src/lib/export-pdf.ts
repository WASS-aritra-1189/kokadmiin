import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any, row: any) => string;
}

export interface ExportOptions {
  title?: string;
  filename?: string;
  columns: ExportColumn[];
  data: any[];
  orientation?: 'portrait' | 'landscape';
}

export function exportToPDF({ title, filename = 'export', columns, data, orientation = 'landscape' }: ExportOptions) {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  
  // Title
  if (title) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 22);
  }

  // Table
  const tableData = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      return col.formatter ? col.formatter(value, row) : value ?? '-';
    })
  );

  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: title ? 28 : 15,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 10, right: 10 },
  });

  doc.save(`${filename}.pdf`);
}

export function exportSelectedToPDF(title: string, columns: ExportColumn[], data: any[]) {
  exportToPDF({ title, filename: title.toLowerCase().replace(/\s+/g, '-'), columns, data });
}