import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartNoAxesCombined, CircleDollarSign, Download, FileSpreadsheet, FileText, Package, RefreshCcw, RotateCcw, ShoppingCart, TrendingUp, Users } from "lucide-react";
import * as XLSX from 'xlsx';
import { dashboardService } from "@/services/dashboard.service";

export const Route = createFileRoute("/_admin/bunch/order-analysis")({
  component: BunchOrderAnalysisPage,
});

const periods = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

const chartColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9", "#8B5CF6"];

const currency = (value: number) =>
  "Rs. " + Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function drawBarChart(doc: any, data: { label: string; value: number }[], x: number, y: number, w: number, h: number, color: [number, number, number]) {
  if (!data.length) return;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(2, Math.floor((w - (data.length - 1) * 2) / data.length));
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
  doc.line(x, y, x, y + h); doc.line(x, y + h, x + w, y + h);
  doc.setFillColor(...color);
  data.forEach((d, i) => {
    const bh = Math.max(1, (d.value / max) * (h - 6));
    const bx = x + i * (barW + 2);
    doc.rect(bx, y + h - bh, barW, bh, 'F');
    doc.setFontSize(5); doc.setTextColor(130, 130, 130);
    const lbl = d.label.length > 6 ? d.label.slice(0, 6) : d.label;
    doc.text(lbl, bx + barW / 2, y + h + 4, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);
}

async function exportBunchPDF(
  period: string,
  sales: any, orders: any,
  revenueChartData: { label: string; value: number }[],
  orderChartData: { label: string; value: number }[],
  statuses: { status: string; count: number }[],
  paymentMethods: any[],
  locations: any[],
) {
  const [{ jsPDF }, { applyPlugin }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  applyPlugin(jsPDF);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const generated = new Date().toLocaleString('en-IN');
  const totalOrders = orders?.totalOrders ?? sales?.totalOrders ?? 0;

  const addPageHeader = (title: string) => {
    doc.setFillColor(17, 24, 39); doc.rect(0, 0, pw, 16, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(`KOK Books — Bunch Order Analysis: ${title}`, 14, 10);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${period}  |  Generated: ${generated}`, pw - 14, 10, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  };

  // ── Page 1: KPI boxes + revenue bar chart + orders bar chart ──────────────
  addPageHeader('Overview');

  const kpis = [
    { label: 'Bunch Revenue', value: currency(sales?.totalRevenue), color: [16, 185, 129] as [number,number,number] },
    { label: 'Bunch Orders', value: String(sales?.totalOrders ?? 0), color: [79, 70, 229] as [number,number,number] },
    { label: 'Avg. Order Value', value: currency(sales?.averageOrderValue), color: [245, 158, 11] as [number,number,number] },
    { label: 'Refunds', value: currency(sales?.refundAmount), color: [239, 68, 68] as [number,number,number] },
  ];
  const boxW = (pw - 28 - 9) / 4;
  kpis.forEach((kpi, i) => {
    const bx = 14 + i * (boxW + 3); const by = 20;
    doc.setFillColor(248, 249, 252); doc.roundedRect(bx, by, boxW, 20, 2, 2, 'F');
    doc.setDrawColor(...kpi.color); doc.setLineWidth(0.8); doc.line(bx, by, bx + boxW, by);
    doc.setLineWidth(0.2); doc.setDrawColor(230, 230, 230); doc.roundedRect(bx, by, boxW, 20, 2, 2, 'S');
    doc.setFontSize(6.5); doc.setTextColor(107, 114, 128); doc.setFont('helvetica', 'normal');
    doc.text(kpi.label.toUpperCase(), bx + boxW / 2, by + 7, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...kpi.color);
    doc.text(kpi.value, bx + boxW / 2, by + 15, { align: 'center' });
  });

  const kpis2 = [
    { label: 'Successful Orders', value: String(orders?.totalSuccessfulOrders ?? 0) },
    { label: 'New Customers', value: String(orders?.newCustomersCount ?? 0) },
    { label: 'Returning Customers', value: String(orders?.returningCustomersCount ?? 0) },
    { label: 'Cancellation Rate', value: `${orders?.cancellationRate ?? 0}%` },
    { label: 'Return Rate', value: `${orders?.returnRate ?? 0}%` },
    { label: 'Net Revenue', value: currency(sales?.netProfit) },
  ];
  const box2W = (pw - 28 - 15) / 6;
  kpis2.forEach((kpi, i) => {
    const bx = 14 + i * (box2W + 3); const by = 44;
    doc.setFillColor(248, 249, 252); doc.roundedRect(bx, by, box2W, 11, 1.5, 1.5, 'F');
    doc.setDrawColor(230, 230, 230); doc.setLineWidth(0.2); doc.roundedRect(bx, by, box2W, 11, 1.5, 1.5, 'S');
    doc.setFontSize(6); doc.setTextColor(107, 114, 128); doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, bx + 3, by + 4.5);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
    doc.text(kpi.value, bx + 3, by + 9);
  });
  doc.setTextColor(0, 0, 0);

  // Revenue trend chart
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
  doc.text('Revenue Trend', 14, 61);
  if (revenueChartData.length) drawBarChart(doc, revenueChartData, 14, 63, pw / 2 - 20, 36, [79, 70, 229]);
  else { doc.setFontSize(7); doc.setTextColor(150,150,150); doc.text('No data.', 14, 80); }

  // Orders trend chart
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
  doc.text('Orders Over Time', pw / 2 + 4, 61);
  if (orderChartData.length) drawBarChart(doc, orderChartData, pw / 2 + 4, 63, pw / 2 - 18, 36, [14, 165, 233]);
  else { doc.setFontSize(7); doc.setTextColor(150,150,150); doc.text('No data.', pw / 2 + 4, 80); }

  // ── Page 2: Status distribution + Payment methods + Locations ─────────────
  doc.addPage(); addPageHeader('Status, Payments & Locations');

  if (statuses.length) {
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
    doc.text('Order Status Distribution', 14, 23);
    (doc as any).autoTable({
      startY: 26, margin: { left: 14, right: pw / 2 + 4 },
      head: [['Status', 'Count', 'Share']],
      body: statuses.map(s => [s.status, s.count, totalOrders ? `${((s.count / totalOrders) * 100).toFixed(1)}%` : '0%']),
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [238, 242, 255] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
  }

  if (paymentMethods.length) {
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
    doc.text('Sales by Payment Method', pw / 2 + 4, 23);
    (doc as any).autoTable({
      startY: 26, margin: { left: pw / 2 + 4, right: 14 },
      head: [['Method', 'Orders', 'Revenue']],
      body: paymentMethods.map(p => [p.method ?? '-', p.orderCount ?? p.count ?? '-', currency(p.revenue)]),
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
  }

  if (locations.length) {
    const afterY = Math.max((doc as any).lastAutoTable?.finalY ?? 60, 60) + 8;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
    doc.text('Top States by Revenue', 14, afterY);
    (doc as any).autoTable({
      startY: afterY + 3, margin: { left: 14, right: 14 },
      head: [['State', 'Orders', 'Revenue']],
      body: locations.map(l => [l.state ?? '-', l.orderCount ?? '-', currency(l.revenue)]),
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 249, 255] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
  }

  // Page numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text(`Page ${p} of ${totalPages}`, pw - 14, ph - 5, { align: 'right' });
    doc.text('KOK Books — Confidential', 14, ph - 5);
  }

  doc.save(`bunch-order-analysis-${period.replace(/\s+/g, '-')}.pdf`);
}

function exportBunchExcel(
  period: string,
  sales: any, orders: any,
  revenueChartData: { label: string; value: number }[],
  orderChartData: { label: string; value: number }[],
  statuses: { status: string; count: number }[],
  paymentMethods: any[],
  locations: any[],
) {
  const totalOrders = orders?.totalOrders ?? sales?.totalOrders ?? 0;
  const wb = XLSX.utils.book_new();

  // Summary
  const summarySheet = XLSX.utils.json_to_sheet([
    { Metric: 'Bunch Revenue', Value: currency(sales?.totalRevenue) },
    { Metric: 'Bunch Orders', Value: sales?.totalOrders ?? 0 },
    { Metric: 'Avg. Order Value', Value: currency(sales?.averageOrderValue) },
    { Metric: 'Net Revenue', Value: currency(sales?.netProfit) },
    { Metric: 'Refunds', Value: currency(sales?.refundAmount) },
    { Metric: 'Revenue Growth', Value: `${sales?.revenueGrowth ?? 0}%` },
    { Metric: 'Successful Orders', Value: orders?.totalSuccessfulOrders ?? 0 },
    { Metric: 'New Customers', Value: orders?.newCustomersCount ?? 0 },
    { Metric: 'Returning Customers', Value: orders?.returningCustomersCount ?? 0 },
    { Metric: 'Cancellation Rate', Value: `${orders?.cancellationRate ?? 0}%` },
    { Metric: 'Return Rate', Value: `${orders?.returnRate ?? 0}%` },
  ]);
  summarySheet['!cols'] = [{ wch: 26 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Revenue trend
  if (revenueChartData.length) {
    const s = XLSX.utils.json_to_sheet(revenueChartData.map(r => ({ Date: r.label, 'Revenue (Rs.)': r.value })));
    s['!cols'] = [{ wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, s, 'Revenue Trend');
  }

  // Orders trend
  if (orderChartData.length) {
    const s = XLSX.utils.json_to_sheet(orderChartData.map(r => ({ Date: r.label, Orders: r.value })));
    s['!cols'] = [{ wch: 18 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, s, 'Orders Trend');
  }

  // Status distribution
  if (statuses.length) {
    const s = XLSX.utils.json_to_sheet(statuses.map(r => ({
      Status: r.status, Count: r.count,
      'Share (%)': totalOrders ? `${((r.count / totalOrders) * 100).toFixed(1)}%` : '0%',
    })));
    s['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, s, 'Order Status');
  }

  // Payment methods
  if (paymentMethods.length) {
    const s = XLSX.utils.json_to_sheet(paymentMethods.map(p => ({
      Method: p.method ?? '-', Orders: p.orderCount ?? p.count ?? '-', 'Revenue (Rs.)': p.revenue ?? 0,
    })));
    s['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, s, 'Payment Methods');
  }

  // Locations
  if (locations.length) {
    const s = XLSX.utils.json_to_sheet(locations.map(l => ({
      State: l.state ?? '-', Orders: l.orderCount ?? '-', 'Revenue (Rs.)': l.revenue ?? 0,
    })));
    s['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, s, 'Locations');
  }

  XLSX.writeFile(wb, `bunch-order-analysis-${period.replace(/\s+/g, '-')}.xlsx`);
}

function MetricCard({ label, value, icon: Icon, color, detail }: { label: string; value: string | number; icon: any; color: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
        <span className="rounded-md p-1.5" style={{ background: `${color}18` }}><Icon className="h-4 w-4" style={{ color }} /></span>
      </div>
      <div className="mt-2 text-[24px] font-semibold text-[#111827]">{value}</div>
      {detail && <div className="mt-1 text-[11px] text-[#6B7280]">{detail}</div>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-[#E5E7EB] bg-white"><h2 className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold text-[#111827]">{title}</h2>{children}</section>;
}

function BunchOrderAnalysisPage() {
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any>(null);
  const [ordersTrend, setOrdersTrend] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Array<{ status: string; count: number }>>([]);

  const salesFilter = period === "week" ? "last_week" : period === "month" ? "this_month" : "today";

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesData, revenueData, paymentData, locationData, orderData, statusData, orderTrendData] = await Promise.all([
        dashboardService.getBunchSalesOverview({ filter: salesFilter }),
        dashboardService.getBunchRevenueTrend({ groupBy: period }),
        dashboardService.getBunchSalesByPaymentMethod({ groupBy: period }),
        dashboardService.getBunchSalesByLocation({ groupBy: period }),
        dashboardService.getBunchOrderAnalytics({ groupBy: period }),
        dashboardService.getBunchOrderStatusDistribution({ groupBy: period }),
        dashboardService.getBunchOrdersOverTime({ groupBy: period }),
      ]);
      setSales(salesData);
      setRevenueTrend(revenueData);
      setPaymentMethods(Array.isArray(paymentData) ? paymentData : []);
      setLocations(Array.isArray(locationData) ? locationData : []);
      setOrders(orderData);
      setStatuses(Array.isArray(statusData) ? statusData : []);
      setOrdersTrend(orderTrendData);
    } catch (err: any) {
      setError(err?.message || "Unable to load bunch order analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period]);

  const revenueChartData = useMemo(() => revenueTrend?.labels?.map((label: string, index: number) => ({ label, value: revenueTrend.datasets?.[0]?.data?.[index] ?? 0 })) ?? [], [revenueTrend]);
  const orderChartData = useMemo(() => ordersTrend?.labels?.map((label: string, index: number) => ({ label, value: ordersTrend.datasets?.[0]?.data?.[index] ?? 0 })) ?? [], [ordersTrend]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Bunch</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Bunch Order Analysis</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Track revenue, fulfillment, customer mix, and order performance for bunch purchases.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px]">
            {periods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button onClick={loadData} disabled={loading} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"><RefreshCcw className="h-3.5 w-3.5" /> Refresh</button>
          <div className="relative group">
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <div className="absolute right-0 top-full z-10 mt-1 hidden min-w-[150px] rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg group-hover:block">
              <button
                onClick={() => exportBunchPDF(period, sales, orders, revenueChartData, orderChartData, statuses, paymentMethods, locations)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB]"
              >
                <FileText className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button
                onClick={() => exportBunchExcel(period, sales, orders, revenueChartData, orderChartData, statuses, paymentMethods, locations)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB]"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="py-12 text-center text-[12px] text-[#6B7280]">Loading bunch order analytics…</div>}
      {error && <div className="mt-5 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>}

      {!loading && !error && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Bunch revenue" value={currency(sales?.totalRevenue)} icon={CircleDollarSign} color="#10B981" detail={`${sales?.revenueGrowth ?? 0}% versus previous period`} />
            <MetricCard label="Bunch orders" value={sales?.totalOrders ?? 0} icon={ShoppingCart} color="#4F46E5" detail={`${orders?.totalSuccessfulOrders ?? 0} successful orders`} />
            <MetricCard label="Average order value" value={currency(sales?.averageOrderValue)} icon={TrendingUp} color="#F59E0B" detail={`Net revenue: ${currency(sales?.netProfit)}`} />
            <MetricCard label="Refunds" value={currency(sales?.refundAmount)} icon={RotateCcw} color="#EF4444" detail={`Return rate: ${orders?.returnRate ?? 0}%`} />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <Card title="Bunch revenue trend">
              <div className="h-72 p-4">{revenueChartData.length ? <ResponsiveContainer><LineChart data={revenueChartData}><CartesianGrid stroke="#F3F4F6" vertical={false} /><XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} /><YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} /><Tooltip formatter={(value: number) => currency(value)} /><Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer> : <Empty />}</div>
            </Card>
            <Card title="Bunch orders over time">
              <div className="h-72 p-4">{orderChartData.length ? <ResponsiveContainer><BarChart data={orderChartData}><CartesianGrid stroke="#F3F4F6" vertical={false} /><XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} /><YAxis fontSize={10} tickLine={false} axisLine={false} /><Tooltip formatter={(value: number) => [value, "Orders"]} /><Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <Empty />}</div>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card title="Sales by payment method">
              <div className="h-72 p-4">{paymentMethods.length ? <ResponsiveContainer><PieChart><Pie data={paymentMethods} dataKey="revenue" nameKey="method" innerRadius={55} outerRadius={88}>{paymentMethods.map((item, index) => <Cell key={item.method ?? index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value: number) => currency(value)} /></PieChart></ResponsiveContainer> : <Empty />}</div>
            </Card>
            <Card title="Order status distribution">
              <div className="max-h-72 overflow-auto p-4">{statuses.length ? <table className="w-full text-[12px]"><thead className="text-[10px] uppercase text-[#6B7280]"><tr><th className="pb-2 text-left">Status</th><th className="pb-2 text-right">Orders</th></tr></thead><tbody>{statuses.map((item) => <tr key={item.status} className="border-t border-[#F3F4F6]"><td className="py-2 capitalize">{item.status.replace(/([A-Z])/g, " $1")}</td><td className="py-2 text-right font-medium">{item.count}</td></tr>)}</tbody></table> : <Empty />}</div>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,360px]">
            <Card title="Top states by bunch revenue">
              <div className="max-h-72 overflow-auto">{locations.length ? <table className="w-full text-[12px]"><thead className="sticky top-0 bg-[#FAFAFA] text-[10px] uppercase text-[#6B7280]"><tr><th className="px-4 py-2 text-left">State</th><th className="px-4 py-2 text-right">Orders</th><th className="px-4 py-2 text-right">Revenue</th></tr></thead><tbody>{locations.map((item) => <tr key={item.state} className="border-t border-[#F3F4F6]"><td className="px-4 py-2 font-medium">{item.state}</td><td className="px-4 py-2 text-right">{item.orderCount}</td><td className="px-4 py-2 text-right font-medium">{currency(item.revenue)}</td></tr>)}</tbody></table> : <Empty />}</div>
            </Card>
            <Card title="Customer mix">
              <div className="grid grid-cols-2 gap-3 p-4"><MetricCard label="New customers" value={orders?.newCustomersCount ?? 0} icon={Users} color="#0EA5E9" /><MetricCard label="Returning" value={orders?.returningCustomersCount ?? 0} icon={Package} color="#8B5CF6" /><MetricCard label="Cancellation rate" value={`${orders?.cancellationRate ?? 0}%`} icon={ChartNoAxesCombined} color="#EF4444" /><MetricCard label="Order statuses" value={statuses.length} icon={Package} color="#F59E0B" /></div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-[12px] text-[#9CA3AF]">No data available for this period.</div>;
}
