import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, PieChart as PieIcon, TrendingUp, Clock, Package, CheckCircle2, RefreshCcw } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";

export const Route = createFileRoute("/_admin/dashboard/order-analysis")({
  component: OrderAnalysisPage,
});

const groupOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

const statusColors: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#6366F1",
  processing: "#22D3EE",
  shipped: "#7C3AED",
  delivered: "#34D399",
  cancelled: "#F87171",
  refunded: "#F472B6",
  returnRequested: "#FB923C",
  returnApproved: "#4ADE80",
  returned: "#A78BFA",
  exchangeRequested: "#FBBF24",
  exchangeApproved: "#38BDF8",
  exchanged: "#60A5FA",
};

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Analytics</div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#111827]">{title}</h1>
          <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-2 rounded-md bg-[#111827] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110 transition">Export</button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon: Icon, color }: { label: string; value: string | number; subValue?: string; icon: any; color: string }) {
  return (
    <div className="rounded-xl border border-[#E6E9EF] bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">{label}</div>
        <div className="rounded-full p-2" style={{ background: `${color}20` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <div className="mt-3 text-[26px] font-extrabold text-[#111827]">{value}</div>
      {subValue && <div className="mt-1 text-[12px] text-[#6B7280]">{subValue}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color = statusColors[normalized] ?? "#6B7280";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: color + "15", color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

function CountList({ items }: { items: Array<{ label: string; count: number }> }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 text-[12px] font-semibold text-[#374151]">Order status breakdown</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-[#FAFAFB] p-3 text-[12px]">
            <div className="text-[#6B7280]">{item.label}</div>
            <div className="mt-2 text-[18px] font-semibold text-[#111827]">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E6E9EF] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
        <div>
          <div className="text-[13px] font-semibold text-[#111827]">{title}</div>
          {subtitle && <div className="text-[12px] text-[#6B7280]">{subtitle}</div>}
        </div>
        <div className="text-[11px] text-[#6B7280]">{children ? null : null}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function OrderAnalysisPage() {
  const [groupBy, setGroupBy] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [statusDistribution, setStatusDistribution] = useState<Array<{ status: string; count: number }>>([]);
  const [ordersOverTime, setOrdersOverTime] = useState<any>(null);

  const unwrap = (r: any) => (r && typeof r === 'object' && 'data' in r ? r.data : r);

  const chartData = useMemo(() => {
    if (!ordersOverTime?.labels?.length) return [];
    return ordersOverTime.labels.map((label: string, index: number) => ({
      label,
      value: ordersOverTime.datasets?.[0]?.data?.[index] ?? 0,
    }));
  }, [ordersOverTime]);

  const pieData = useMemo(() => {
    return statusDistribution.map((item) => ({
      name: item.status,
      value: item.count,
      color: statusColors[item.status.toLowerCase()] ?? "#6B7280",
    }));
  }, [statusDistribution]);

  const breakdownItems = useMemo(() => {
    if (!analytics?.orderStatusBreakdown) return [];
    return Object.entries(analytics.orderStatusBreakdown).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^(.)/, (m) => m.toUpperCase()),
      count: Number(value),
    }));
  }, [analytics]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [orderAnalyticsRes, statusDistributionRes, ordersOverTimeRes] = await Promise.all([
        dashboardService.getOrderAnalytics({ groupBy }),
        dashboardService.getOrderStatusDistribution({ groupBy }),
        dashboardService.getOrdersOverTime({ groupBy }),
      ]);

      setAnalytics(unwrap(orderAnalyticsRes));
      setStatusDistribution(unwrap(statusDistributionRes) || []);
      setOrdersOverTime(unwrap(ordersOverTimeRes));
    } catch (err: any) {
      setError(err?.message || "Unable to fetch order analytics data.");
      setAnalytics(null);
      setStatusDistribution([]);
      setOrdersOverTime(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupBy]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader title="Order Analytics" subtitle="Monitor order performance, status distribution, and fulfillment trends." />
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px]"
          >
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {loading && <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-6 text-center text-[12px] text-[#6B7280]">Loading order analytics…</div>}
      {error && <div className="mt-6 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] p-4 text-[12px] text-[#B91C1C]">{error}</div>}

      {!loading && analytics && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total orders"
              value={analytics.totalOrders ?? 0}
              subValue="All orders in period"
              icon={Package}
              color="#736dec"
            />
            <MetricCard
              label="Successful orders"
              value={analytics.totalSuccessfulOrders ?? 0}
              subValue="Paid and fulfilled"
              icon={CheckCircle2}
              color="#3ee8b0"
            />
            <MetricCard
              label="Cancellation rate"
              value={`${analytics.cancellationRate?.toFixed(2) ?? 0}%`}
              subValue={`Calculated from ${analytics.totalOrders ?? 0} orders`}
              icon={ArrowDownRight}
              color="#f73939"
            />
            <MetricCard
              label="Return rate"
              value={`${analytics.returnRate?.toFixed(2) ?? 0}%`}
              subValue="Returns + refunds"
              icon={ArrowUpRight}
              color="#efbf6d"
            />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[360px,1fr]">
            <div className="space-y-4">
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">Customer mix</div>
                    <div className="text-[11px] text-[#6B7280]">New vs returning customers</div>
                  </div>
                  <div className="rounded-md bg-[#F3F4F6] p-2">
                    <Clock className="h-4 w-4 text-[#374151]" />
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#FAFAFB] p-3">
                    <div className="text-[11px] text-[#6B7280]">New customers</div>
                    <div className="mt-2 text-[22px] font-semibold text-[#111827]">{analytics.newCustomersCount ?? 0}</div>
                  </div>
                  <div className="rounded-lg bg-[#FAFAFB] p-3">
                    <div className="text-[11px] text-[#6B7280]">Returning customers</div>
                    <div className="mt-2 text-[22px] font-semibold text-[#111827]">{analytics.returningCustomersCount ?? 0}</div>
                  </div>
                </div>
              </div>

              <CountList items={breakdownItems} />
            </div>

            <div className="space-y-4">
              <ChartCard title="Order status distribution" subtitle="Counts by status">
                <div className="flex h-full flex-col justify-between">
                  <div className="h-[240px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={48}
                          outerRadius={88}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [value, "Orders"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid gap-2 text-[11px] text-[#6B7280] sm:grid-cols-2">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                        <span className="truncate">{entry.name}</span>
                        <span className="font-semibold text-[#111827]">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#111827]">Orders over time</div>
                  <div className="text-[11px] text-[#6B7280]">Trend for selected period</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] text-[#374151]">
                  <TrendingUp className="h-3.5 w-3.5" /> Trend
                </div>
              </div>
              <div className="h-72 p-4">
                {chartData.length ? (
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value: number) => [`${value}`, "Orders"]} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                      <Area type="monotone" dataKey="value" stroke="#0EA5E9" fill="#0EA5E915" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] text-[#6B7280]">No trend data available for this period.</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#111827]">Status distribution table</div>
                  <div className="text-[11px] text-[#6B7280]">Detailed breakdown by status</div>
                </div>
                <div className="text-[11px] text-[#6B7280]">{statusDistribution.length} categories</div>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-[12px]">
                  <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                    <tr>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusDistribution.map((item) => (
                      <tr key={item.status} className="border-t border-[#F3F4F6]">
                        <td className="px-3 py-2"><StatusBadge status={item.status} /></td>
                        <td className="px-3 py-2 text-right font-medium text-[#111827]">{item.count}</td>
                      </tr>
                    ))}
                    {statusDistribution.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-8 text-center text-[12px] text-[#6B7280]">No status distribution data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
