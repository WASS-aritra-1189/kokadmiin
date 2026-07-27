import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, RotateCcw, FileSpreadsheet, FileText } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { exportToPDF, exportToExcel } from "@/lib/export";

export const Route = createFileRoute("/_admin/reports/sales")({
  component: SalesReportPage,
});

const groupOptions = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "this_month", label: "This month" },
];

function currency(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

function KpiCard({ label, value, subValue, icon: Icon, color, invert }: {
  label: string; value: string | number; subValue?: string; icon: any; color: string; invert?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
        <div className="rounded-md p-1.5" style={{ background: color + "15" }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="mt-2 text-[24px] font-semibold text-[#111827]">{value}</div>
      {subValue && <div className={`mt-1 text-[11px] font-medium ${invert ? "text-[#EF4444]" : "text-[#10B981]"}`}>{subValue}</div>}
    </div>
  );
}

function SalesReportPage() {
  const [groupBy, setGroupBy] = useState("last_week");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any>(null);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [salesByPayment, setSalesByPayment] = useState<any[]>([]);
  const [salesByLocation, setSalesByLocation] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Map filter to groupBy for different APIs
  const groupByValue = groupBy === 'last_week' ? 'week' : groupBy === 'this_month' ? 'month' : groupBy;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, trend, byCat, byPay, byLoc] = await Promise.all([
        dashboardService.getSalesOverview({ filter: groupBy }),
        dashboardService.getRevenueTrend({ groupBy: groupByValue }),
        dashboardService.getSalesByCategory({ groupBy: groupByValue }),
        dashboardService.getSalesByPaymentMethod({ groupBy: groupByValue }),
        dashboardService.getSalesByLocation({ groupBy: groupByValue }),
      ]);
      setOverview(ov);
      setRevenueTrend(trend);
      setSalesByCategory(byCat);
      setSalesByPayment(byPay);
      setSalesByLocation(byLoc);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!overview) return;
    const columns = [
      { key: 'state', header: 'State' },
      { key: 'orderCount', header: 'Orders' },
      { key: 'revenue', header: 'Revenue', formatter: (v: number) => currency(v) },
    ];
    exportToPDF({ title: 'Sales by Location', filename: 'sales-by-location', columns, data: salesByLocation });
  };

  const handleExportExcel = () => {
    if (!overview) return;
    const columns = [
      { key: 'state', header: 'State' },
      { key: 'orderCount', header: 'Orders' },
      { key: 'revenue', header: 'Revenue', formatter: (v: number) => currency(v) },
    ];
    exportToExcel({ title: 'Sales by Location', filename: 'sales-by-location', columns, data: salesByLocation });
  };

  useEffect(() => { loadData(); }, [groupBy]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Reports</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Sales Report</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Track sales performance, revenue trends, and payment analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px]"
          >
            {groupOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="relative group">
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">
              <Download className="h-3.5 w-3.5" />Export
            </button>
            <div className="absolute right-0 top-full mt-1 hidden min-w-[140px] rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg group-hover:block z-10">
              <button
                onClick={handleExportPDF}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB]"
              >
                <FileText className="h-3.5 w-3.5" />Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB]"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="py-12 text-center text-[12px] text-[#6B7280]">Loading...</div>}
      {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>}

      {overview && !loading && (
        <>
          {/* KPIs */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total Revenue" value={currency(overview.totalRevenue || 0)} icon={DollarSign} color="#10B981" />
            <KpiCard label="Total Orders" value={overview.totalOrders || 0} icon={ShoppingCart} color="#4F46E5" />
            <KpiCard label="Average Order Value" value={currency(overview.averageOrderValue || 0)} icon={TrendingUp} color="#F59E0B" />
            <KpiCard label="Refunds" value={currency(overview.refundAmount || 0)} icon={RotateCcw} color="#EF4444" invert />
          </div>

          {/* Revenue Trend Chart */}
          {revenueTrend && revenueTrend.labels && (
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Revenue Trend</div>
              <div className="h-64 px-2 pb-2">
                <ResponsiveContainer>
                  <LineChart data={revenueTrend.labels.map((l: string, i: number) => ({ name: l, value: revenueTrend.datasets[0]?.data[i] || 0 }))} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => currency(v)} />
                    <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sales by Category & Payment Method */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Sales by Category */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Sales by Category</div>
              {salesByCategory.length > 0 ? (
                <div className="h-64 px-2 pb-2">
                  <ResponsiveContainer>
                    <BarChart data={salesByCategory.slice(0, 8)} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
                      <YAxis type="category" dataKey="category" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} width={80} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => currency(v)} />
                      <Bar dataKey="revenue" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-[12px] text-[#9CA3AF]">No data available</div>
              )}
            </div>

            {/* Sales by Payment Method */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Sales by Payment Method</div>
              {salesByPayment.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={salesByPayment}
                        dataKey="revenue"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {salesByPayment.map((_, i) => (
                          <Cell key={i} fill={["#4F46E5", "#10B981", "#F59E0B", "#EF4444"][i % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => currency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-[12px] text-[#9CA3AF]">No data available</div>
              )}
            </div>
          </div>

          {/* Sales by Location */}
          <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white">
            <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Top States by Revenue</div>
            {salesByLocation.length > 0 ? (
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#FAFAFA] text-[10px] uppercase text-[#6B7280] sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">State</th>
                      <th className="px-4 py-2 text-right">Orders</th>
                      <th className="px-4 py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesByLocation.map((item, i) => (
                      <tr key={i} className="border-t border-[#F3F4F6]">
                        <td className="px-4 py-2 font-medium">{item.state}</td>
                        <td className="px-4 py-2 text-right">{item.orderCount}</td>
                        <td className="px-4 py-2 text-right font-medium">{currency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[12px] text-[#9CA3AF]">No data available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}