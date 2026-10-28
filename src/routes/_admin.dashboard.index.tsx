import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from 'xlsx';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart } from "recharts";
import { ArrowDownRight, ArrowUpRight, Package, ShoppingBag, Wallet, AlertTriangle, Download, FileText, FileSpreadsheet } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { useState } from "react";
import { DashboardDateFilter, defaultDashboardDate, type DashboardDateState } from "@/components/ui/dashboard-date-filter";

function currency(v: number) { return "Rs. " + Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export const Route = createFileRoute("/_admin/dashboard/")({
  component: DashboardPage,
});

const statusColors: Record<string, string> = {
  PENDING: "#F59E0B", CONFIRMED: "#8B5CF6", PROCESSING: "#0EA5E9", PACKED: "#6366F1",
  SHIPPED: "#0EA5E9", DELIVERED: "#10B981", CANCELLED: "#6B7280", REFUNDED: "#EF4444",
  RETURN_REQUESTED: "#F97316", RETURN_APPROVED: "#F59E0B", RETURNED: "#EF4444",
  EXCHANGE_REQUESTED: "#8B5CF6", EXCHANGE_APPROVED: "#8B5CF6", EXCHANGED: "#10B981",
  New: "#4F46E5", Processing: "#F59E0B", Packed: "#8B5CF6",
  Shipped: "#0EA5E9", Delivered: "#10B981", Returned: "#EF4444", Cancelled: "#6B7280",
};

function buildDashboardRows(data: any) {
  const period = '';
  const summaryRows = [
    { label: 'Total Revenue', value: `Rs. ${Number(data?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Total Orders', value: String(data?.totalOrders || 0) },
    { label: 'Avg. Order Value', value: `Rs. ${Number(data?.averageOrderValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Total Books', value: String(data?.totalBooks || 0) },
    { label: 'Total Stock Units', value: String(data?.totalStock || 0) },
    { label: 'Bunches', value: String(data?.totalBunch || 0) },
    { label: 'Bunch Orders', value: String(data?.totalBunchOrders || 0) },
  ];
  const statusRows = (data?.orderByStatus || []).map((s: any) => ({
    status: s.status,
    count: Number(s.count),
    share: data?.totalOrders ? `${((s.count / data.totalOrders) * 100).toFixed(1)}%` : '0%',
  }));
  const trendRows = (data?.revenueGraph?.labels || []).map((label: string, i: number) => ({
    date: label,
    orders: data?.revenueGraph?.datasets?.[1]?.data?.[i] ?? '-',
    revenue: Number(data.revenueGraph.datasets?.[0]?.data?.[i] || 0),
    revenueFormatted: `Rs. ${Number(data.revenueGraph.datasets?.[0]?.data?.[i] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  }));
  const topBooksRows = (data?.topSellingBooks || []).map((b: any, i: number) => ({
    rank: i + 1,
    title: b.title ?? '',
    author: b.author ?? '-',
    category: b.category ?? '-',
    price: b.price ? `Rs. ${Number(b.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-',
    totalSold: Number(b.totalSold ?? 0),
    revenue: b.price ? `Rs. ${(Number(b.price) * Number(b.totalSold ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-',
  }));
  const recentRows = (data?.recentOrders || []).map((o: any) => ({
    orderNumber: o.orderNumber ?? '',
    customer: o.customer?.name ?? '',
    email: o.customer?.email ?? '',
    phone: o.customer?.phone ?? '-',
    paymentMethod: o.paymentMethod ?? '',
    status: o.status ?? '',
    items: o.itemCount ?? '-',
    total: `Rs. ${Number(o.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '-',
  }));
  return { summaryRows, statusRows, trendRows, topBooksRows, recentRows };
}

// Draw a simple bar chart onto the PDF canvas using jsPDF line/rect primitives
function drawBarChart(
  doc: any,
  data: { label: string; value: number }[],
  x: number, y: number, w: number, h: number,
  color: [number, number, number],
) {
  if (!data.length) return;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.floor((w - (data.length - 1) * 2) / data.length);
  // axis
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(x, y, x, y + h);
  doc.line(x, y + h, x + w, y + h);
  // bars
  doc.setFillColor(...color);
  data.forEach((d, i) => {
    const bh = Math.max(1, (d.value / max) * (h - 6));
    const bx = x + i * (barW + 2);
    const by = y + h - bh;
    doc.rect(bx, by, barW, bh, 'F');
    // label
    doc.setFontSize(5.5);
    doc.setTextColor(120, 120, 120);
    const lbl = d.label.length > 5 ? d.label.slice(0, 5) : d.label;
    doc.text(lbl, bx + barW / 2, y + h + 4, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);
}

async function exportDashboardPDF(data: any, date: DashboardDateState) {
  const [{ jsPDF }, { applyPlugin }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  applyPlugin(jsPDF);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const period = date.preset === 'custom' ? `${date.startDate} to ${date.endDate}` : date.preset.replace(/_/g, ' ');
  const generated = new Date().toLocaleString('en-IN');
  const { summaryRows, statusRows, trendRows, topBooksRows, recentRows } = buildDashboardRows(data);

  // ── Page 1: Header + KPI boxes + Revenue bar chart + Status table ──────────
  // Header band
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pw, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('KOK Books — Dashboard Overview', 14, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${period}`, pw - 14, 8, { align: 'right' });
  doc.text(`Generated: ${generated}`, pw - 14, 13, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // KPI boxes — 4 across
  const kpis = [
    { label: 'Total Revenue', value: summaryRows[0].value, color: [79, 70, 229] as [number,number,number] },
    { label: 'Total Orders', value: summaryRows[1].value, color: [14, 165, 233] as [number,number,number] },
    { label: 'Avg. Order Value', value: summaryRows[2].value, color: [16, 185, 129] as [number,number,number] },
    { label: 'Total Stock', value: summaryRows[4].value, color: [245, 158, 11] as [number,number,number] },
  ];
  const boxW = (pw - 28 - 9) / 4;
  kpis.forEach((kpi, i) => {
    const bx = 14 + i * (boxW + 3);
    const by = 22;
    doc.setFillColor(248, 249, 252);
    doc.roundedRect(bx, by, boxW, 20, 2, 2, 'F');
    doc.setDrawColor(...kpi.color);
    doc.setLineWidth(0.8);
    doc.line(bx, by, bx + boxW, by); // top accent line
    doc.setLineWidth(0.2);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(bx, by, boxW, 20, 2, 2, 'S');
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label.toUpperCase(), bx + boxW / 2, by + 7, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, bx + boxW / 2, by + 15, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);

  // Secondary KPI row — Books, Bunches, Bunch Orders
  const kpis2 = [
    { label: 'Total Books', value: summaryRows[3].value },
    { label: 'Bunches', value: summaryRows[5].value },
    { label: 'Bunch Orders', value: summaryRows[6].value },
  ];
  const box2W = (pw - 28 - 6) / 3;
  kpis2.forEach((kpi, i) => {
    const bx = 14 + i * (box2W + 3);
    const by = 45;
    doc.setFillColor(248, 249, 252);
    doc.roundedRect(bx, by, box2W, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.roundedRect(bx, by, box2W, 12, 1.5, 1.5, 'S');
    doc.setFontSize(6.5);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, bx + 4, by + 5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(kpi.value, bx + 4, by + 10);
  });
  doc.setTextColor(0, 0, 0);

  // Revenue bar chart
  const chartY = 62;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Revenue Trend', 14, chartY - 2);
  doc.setFont('helvetica', 'normal');
  if (trendRows.length) {
    drawBarChart(doc, trendRows.map(r => ({ label: r.date, value: r.revenue })), 14, chartY, pw / 2 - 20, 38, [79, 70, 229]);
  } else {
    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('No trend data for this period.', 14, chartY + 20);
  }

  // Orders by status table (right side of page 1)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Orders by Status', pw / 2 + 4, chartY - 2);
  if (statusRows.length) {
    (doc as any).autoTable({
      startY: chartY,
      margin: { left: pw / 2 + 4, right: 14 },
      head: [['Status', 'Count', 'Share']],
      body: statusRows.map(r => [r.status, r.count, r.share]),
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
  }

  // ── Page 2: Revenue trend detail table ─────────────────────────────────────
  if (trendRows.length) {
    doc.addPage();
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, pw, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Revenue Trend — Detail', 14, 9);
    doc.setTextColor(0, 0, 0);
    (doc as any).autoTable({
      startY: 18,
      margin: { left: 14, right: 14 },
      head: [['Date', 'Revenue']],
      body: trendRows.map(r => [r.date, r.revenueFormatted]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [238, 242, 255] },
      columnStyles: { 1: { halign: 'right' } },
    });
  }

  // ── Page 3: Top selling books ───────────────────────────────────────────────
  if (topBooksRows.length) {
    doc.addPage();
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, pw, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Top Selling Books', 14, 9);
    doc.setTextColor(0, 0, 0);
    (doc as any).autoTable({
      startY: 18,
      margin: { left: 14, right: 14 },
      head: [['#', 'Title', 'Author', 'Category', 'Price', 'Units Sold', 'Est. Revenue']],
      body: topBooksRows.map(r => [r.rank, r.title, r.author, r.category, r.price, r.totalSold, r.revenue]),
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: { 0: { halign: 'center', cellWidth: 8 }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
    });
  }

  // ── Page 4: Recent orders ───────────────────────────────────────────────────
  if (recentRows.length) {
    doc.addPage();
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, pw, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Recent Orders', 14, 9);
    doc.setTextColor(0, 0, 0);
    (doc as any).autoTable({
      startY: 18,
      margin: { left: 14, right: 14 },
      head: [['Order #', 'Customer', 'Email', 'Payment', 'Status', 'Total', 'Date']],
      body: recentRows.map(r => [r.orderNumber, r.customer, r.email, r.paymentMethod, r.status, r.total, r.date]),
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 249, 255] },
      columnStyles: { 5: { halign: 'right' } },
    });
  }

  // Page numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${p} of ${totalPages}`, pw - 14, doc.internal.pageSize.getHeight() - 5, { align: 'right' });
    doc.text('KOK Books — Confidential', 14, doc.internal.pageSize.getHeight() - 5);
  }

  doc.save(`dashboard-${period.replace(/\s+/g, '-')}.pdf`);
}

function DashboardPage() {
  const [date, setDate] = useState<DashboardDateState>(defaultDashboardDate("today"));

  const isCustomReady = date.preset !== "custom" || (!!date.startDate && !!date.endDate);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-overview", date],
    queryFn: () => dashboardService.getOverview({
      filter: date.preset,
      ...(date.preset === "custom" ? { startDate: date.startDate, endDate: date.endDate } : {}),
    }),
    enabled: isCustomReady,
  });

  const revenueSeries = data?.revenueGraph?.labels?.map((label: string, i: number) => ({
    d: label,
    v: data?.revenueGraph?.datasets?.[0]?.data?.[i] || 0,
  })) || [];

  const donutData = data?.orderByStatus?.map((s: any) => ({ name: s.status, value: s.count })) || [];

  const topBooks = data?.topSellingBooks?.slice(0, 6) || [];
  const recent = data?.recentOrders?.slice(0, 6) || [];

  const handleExportPDF = () => { exportDashboardPDF(data, date); };

  const handleExportExcel = () => {
    const { summaryRows, statusRows, trendRows, topBooksRows, recentRows } = buildDashboardRows(data);
    const period = date.preset === 'custom' ? `${date.startDate} to ${date.endDate}` : date.preset;
    const wb = XLSX.utils.book_new();

    // Summary sheet with styled header row
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 28 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Order status with share
    if (statusRows.length) {
      const statusSheet = XLSX.utils.json_to_sheet(statusRows.map(r => ({ Status: r.status, Count: r.count, 'Share (%)': r.share })));
      statusSheet['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, statusSheet, 'Order Status');
    }

    // Revenue trend
    if (trendRows.length) {
      const trendSheet = XLSX.utils.json_to_sheet(trendRows.map(r => ({ Date: r.date, 'Revenue (Rs.)': r.revenue })));
      trendSheet['!cols'] = [{ wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, trendSheet, 'Revenue Trend');
    }

    // Top books with all columns
    if (topBooksRows.length) {
      const booksSheet = XLSX.utils.json_to_sheet(topBooksRows.map(r => ({
        '#': r.rank, Title: r.title, Author: r.author, Category: r.category,
        'Price (Rs.)': r.price, 'Units Sold': r.totalSold, 'Est. Revenue': r.revenue,
      })));
      booksSheet['!cols'] = [{ wch: 4 }, { wch: 40 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, booksSheet, 'Top Books');
    }

    // Recent orders with all columns
    if (recentRows.length) {
      const ordersSheet = XLSX.utils.json_to_sheet(recentRows.map(r => ({
        'Order #': r.orderNumber, Customer: r.customer, Email: r.email, Phone: r.phone,
        Payment: r.paymentMethod, Status: r.status, 'Total (Rs.)': r.total, Date: r.date,
      })));
      ordersSheet['!cols'] = [{ wch: 16 }, { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ordersSheet, 'Recent Orders');
    }

    XLSX.writeFile(wb, `dashboard-${period}.xlsx`);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Overview</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Real-time performance across your bookstore.</p>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <DashboardDateFilter value={date} onChange={setDate} />
          <div className="relative group">
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <div className="absolute right-0 top-full z-10 mt-1 hidden min-w-[150px] rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg group-hover:block">
              <button onClick={handleExportPDF} className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB]">
                <FileText className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button onClick={handleExportExcel} className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB]">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Revenue" value={currency(data?.totalRevenue || 0)} icon={Wallet} tint="#4F46E5" />
        <Kpi label="Orders" value={String(data?.totalOrders || 0)} icon={ShoppingBag} tint="#0EA5E9" />
        <Kpi label="Avg. order value" value={currency(data?.averageOrderValue || 0)} icon={Package} tint="#10B981" />
        <Kpi label="Stock" value={String(data?.totalStock || 0)} icon={AlertTriangle} tint="#F59E0B" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue" subtitle="Last 14 days" right={<Legend items={[{ label: "This period", color: "#4F46E5" }]} />} />
          <div className="h-64 px-2 pb-2">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="d" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} formatter={(v: number) => currency(v)} />
                <Area type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Orders by status" subtitle={`${data?.totalOrders || 0} orders`} />
          <div className="grid grid-cols-2 items-center gap-2 p-4">
            <div className="h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={donutData} innerRadius={38} outerRadius={62} dataKey="value" stroke="none">
                    {donutData.map((d) => <Cell key={d.name} fill={statusColors[d.name]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#374151]">
                    <span className="h-2 w-2 rounded-full" style={{ background: statusColors[d.name] }} />{d.name}
                  </span>
                  <span className="font-medium tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Top selling books" subtitle="Trailing 30 days" right={<a className="text-[11px] font-medium text-[#4F46E5]" href="#">View all</a>} />
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB]"><th className="px-4 py-2 text-left">Book</th><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-right">Price</th><th className="px-4 py-2 text-right">Stock</th></tr>
            </thead>
            <tbody>
              {topBooks.map((b: any) => (
                <tr key={b.bookId} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-6 rounded-sm bg-gray-200" />
                      <div>
                        <div className="font-medium text-[#111827]">{b.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{b.totalSold} sold</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Stock Info" subtitle={`${data?.totalBooks || 0} books`} />
          <div className="divide-y divide-[#F3F4F6] px-4 py-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-[#6B7280]">Total Books</span>
              <span className="text-[12px] font-semibold">{data?.totalBooks || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-[#6B7280]">Total Stock</span>
              <span className="text-[12px] font-semibold">{data?.totalStock || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-[#6B7280]">Bunches</span>
              <span className="text-[12px] font-semibold">{data?.totalBunch || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-[#6B7280]">Bunch Orders</span>
              <span className="text-[12px] font-semibold">{data?.totalBunchOrders || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Recent orders" right={<a className="text-[11px] font-medium text-[#4F46E5]" href="/orders">View all →</a>} />
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Items</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o: any) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2 font-mono text-[11px] text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-4 py-2"><div className="font-medium">{o.customer?.name}</div><div className="text-[10px] text-[#6B7280]">{o.customer?.email}</div></td>
                  <td className="px-4 py-2 text-[#4B5563]">{o.paymentMethod}</td>
                  <td className="px-4 py-2"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-2 text-right tabular-nums">-</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{currency(o.paidAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tint }: { label: string; value: string; icon: any; tint: string }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">{label}</div>
        <div className="rounded-md p-1.5" style={{ background: tint + "15", color: tint }}><Icon className="h-3.5 w-3.5" /></div>
      </div>
      <div className="mt-2 text-[22px] font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"overflow-hidden rounded-lg border border-[#E5E7EB] bg-white " + className}>{children}</div>;
}
export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
      <div>
        <div className="text-[13px] font-semibold">{title}</div>
        {subtitle && <div className="text-[10px] text-[#6B7280]">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex items-center gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />{i.label}
        </div>
      ))}
    </div>
  );
}
export function StatusPill({ status }: { status: string }) {
  const color = statusColors[status] ?? "#6B7280";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: color + "15", color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{status}
    </span>
  );
}

