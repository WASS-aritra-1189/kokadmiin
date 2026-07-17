import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingUp, TrendingDown, DollarSign, Percent, Wallet } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";

export const Route = createFileRoute("/_admin/reports/revenue")({
  component: RevenueReportPage,
});

const groupOptions = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "this_month", label: "This month" },
];

function currency(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

function KpiCard({ label, value, subValue, icon: Icon, color }: {
  label: string; value: string | number; subValue?: string; icon: any; color: string;
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
      {subValue && <div className="mt-1 text-[11px] font-medium text-[#10B981]">{subValue}</div>}
    </div>
  );
}

function RevenueReportPage() {
  const [groupBy, setGroupBy] = useState("last_week");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Map filter to groupBy for different APIs
  const groupByValue = groupBy === 'last_week' ? 'week' : groupBy === 'this_month' ? 'month' : groupBy;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, trend] = await Promise.all([
        dashboardService.getSalesOverview({ filter: groupBy }),
        dashboardService.getRevenueTrend({ groupBy: groupByValue }),
      ]);
      setOverview(ov);
      setRevenueTrend(trend);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [groupBy]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Reports</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Revenue Report</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Analyze revenue, net profit, and growth trends.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px]"
          >
            {groupOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">
            <Download className="h-3.5 w-3.5" />Export
          </button>
        </div>
      </div>

      {loading && <div className="py-12 text-center text-[12px] text-[#6B7280]">Loading...</div>}
      {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>}

      {overview && !loading && (
        <>
          {/* KPIs */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard 
              label="Total Revenue" 
              value={currency(overview.totalRevenue || 0)} 
              icon={DollarSign} 
              color="#10B981" 
            />
            <KpiCard 
              label="Net Profit" 
              value={currency(overview.netProfit || 0)} 
              subValue={`${(overview.revenueGrowth || 0).toFixed(1)}% growth`}
              icon={Wallet} 
              color="#4F46E5" 
            />
            <KpiCard 
              label="Refund Amount" 
              value={currency(overview.refundAmount || 0)} 
              icon={TrendingDown} 
              color="#EF4444" 
            />
            <KpiCard 
              label="Revenue Growth" 
              value={`${(overview.revenueGrowth || 0).toFixed(1)}%`} 
              icon={Percent} 
              color="#F59E0B" 
            />
          </div>

          {/* Revenue Trend Chart */}
          {revenueTrend && revenueTrend.labels && (
            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Revenue Over Time</div>
              <div className="h-80 px-2 pb-2">
                <ResponsiveContainer>
                  <LineChart data={revenueTrend.labels.map((l: string, i: number) => ({ date: l, revenue: revenueTrend.datasets[0]?.data[i] || 0 }))} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => currency(v)} />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="text-[11px] font-medium uppercase text-[#6B7280]">Key Metrics</div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[#6B7280]">Total Orders</span>
                  <span className="text-[12px] font-medium">{overview.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[#6B7280]">Average Order Value</span>
                  <span className="text-[12px] font-medium">{currency(overview.averageOrderValue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[#6B7280]">Refund Rate</span>
                  <span className="text-[12px] font-medium">
                    {overview.totalRevenue > 0 
                      ? ((overview.refundAmount / overview.totalRevenue) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}