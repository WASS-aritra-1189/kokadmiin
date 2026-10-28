import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Order Analytics PDF ────────────────────────────────────────────────────

export interface OrderAnalyticsPDFData {
  dateLabel: string;
  analytics: {
    totalOrders: number;
    totalSuccessfulOrders: number;
    cancellationRate: number;
    returnRate: number;
    newCustomersCount: number;
    returningCustomersCount: number;
    orderStatusBreakdown?: Record<string, number>;
  };
  statusDistribution: Array<{ status: string; count: number }>;
  ordersOverTime: { labels: string[]; datasets: Array<{ data: number[] }> } | null;
}

export function exportOrderAnalyticsPDF({
  dateLabel,
  analytics,
  statusDistribution,
  ordersOverTime,
}: OrderAnalyticsPDFData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  let y = 14;

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Analytics Report', margin, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${dateLabel}   |   Generated: ${now}`, margin, 20);
  y = 30;

  // ── KPI Summary ─────────────────────────────────────────────────────────
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Performance Indicators', margin, y);
  y += 4;

  const totalPie = statusDistribution.reduce((s, d) => s + d.count, 0);
  const newPct = analytics.newCustomersCount + analytics.returningCustomersCount > 0
    ? Math.round((analytics.newCustomersCount / (analytics.newCustomersCount + analytics.returningCustomersCount)) * 100)
    : 0;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Notes']],
    body: [
      ['Total Orders', String(analytics.totalOrders ?? 0), 'All orders in selected period'],
      ['Successful Orders', String(analytics.totalSuccessfulOrders ?? 0), 'Paid and fulfilled'],
      ['Cancellation Rate', `${(analytics.cancellationRate ?? 0).toFixed(1)}%`, `From ${analytics.totalOrders ?? 0} orders`],
      ['Return Rate', `${(analytics.returnRate ?? 0).toFixed(1)}%`, 'Returns + refunds'],
      ['New Customers', String(analytics.newCustomersCount ?? 0), `${newPct}% of total customers`],
      ['Returning Customers', String(analytics.returningCustomersCount ?? 0), `${100 - newPct}% of total customers`],
    ],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { cellWidth: 30, halign: 'center' }, 2: { textColor: [107, 114, 128] } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Status Distribution ──────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Order Status Distribution', margin, y);
  y += 4;

  if (statusDistribution.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Status', 'Count', 'Share (%)', 'Bar']],
      body: statusDistribution.map((item) => {
        const share = totalPie ? ((item.count / totalPie) * 100).toFixed(1) : '0.0';
        const bar = '█'.repeat(Math.round((item.count / Math.max(...statusDistribution.map(i => i.count))) * 20));
        return [item.status, String(item.count), `${share}%`, bar];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { textColor: [99, 102, 241], fontSize: 6 },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text('No status distribution data available.', margin, y + 4);
    y += 12;
  }

  // ── Status Breakdown (from analytics.orderStatusBreakdown) ───────────────
  if (analytics.orderStatusBreakdown && Object.keys(analytics.orderStatusBreakdown).length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Detailed Status Breakdown', margin, y);
    y += 4;

    const breakdownRows = Object.entries(analytics.orderStatusBreakdown).map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').replace(/^(.)/, (m: string) => m.toUpperCase()),
      String(value),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Status Label', 'Count']],
      body: breakdownRows,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' } },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Orders Over Time ─────────────────────────────────────────────────────
  if (ordersOverTime?.labels?.length) {
    // new page if not enough space
    if (y > 220) { doc.addPage(); y = 14; }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Orders Over Time', margin, y);
    y += 4;

    const timeRows = ordersOverTime.labels.map((label: string, i: number) => [
      label,
      String(ordersOverTime.datasets?.[0]?.data?.[i] ?? 0),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Period', 'Orders']],
      body: timeRows,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' } },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(
      `KOK Books — Order Analytics   |   Page ${p} of ${totalPages}`,
      margin,
      doc.internal.pageSize.getHeight() - 6,
    );
  }

  const safeDate = dateLabel.replace(/[^a-zA-Z0-9]/g, '-');
  doc.save(`order-analytics-${safeDate}.pdf`);
}

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