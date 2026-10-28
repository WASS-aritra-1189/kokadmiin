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
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Package,
  CheckCircle2,
  RefreshCcw,
  Users,
  UserCheck,
  FileDown,
} from "lucide-react";
import { exportOrderAnalyticsPDF } from "@/lib/export-pdf";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardDateFilter,
  defaultDashboardDate,
  type DashboardDateState,
} from "@/components/ui/dashboard-date-filter";

export const Route = createFileRoute("/_admin/dashboard/order-analysis")({
  component: OrderAnalysisPage,
});

const statusColors: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#6366F1",
  processing: "#22D3EE",
  shipped: "#7C3AED",
  delivered: "#34D399",
  cancelled: "#F87171",
  refunded: "#F472B6",
  returnrequested: "#FB923C",
  returnapproved: "#4ADE80",
  returned: "#A78BFA",
  exchangerequested: "#FBBF24",
  exchangeapproved: "#38BDF8",
  exchanged: "#60A5FA",
};

function getStatusColor(status: string) {
  return statusColors[status.toLowerCase()] ?? "#6B7280";
}

function StatusBadge({ status }: { status: string }) {
  const color = getStatusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: color + "18", color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  accent: string;
  trend?: "up" | "down" | "neutral";
}

function MetricCard({ label, value, subValue, icon: Icon, accent, trend }: MetricCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: accent + "30" }}
    >
      {/* accent top bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />

      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: accent + "15" }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: trend === "up" ? "#34D39918" : trend === "down" ? "#F8717118" : "#6B728018",
              color: trend === "up" ? "#059669" : trend === "down" ? "#DC2626" : "#6B7280",
            }}
          >
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-[28px] font-black tracking-tight text-[#111827]">{value}</div>
        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{label}</div>
        {subValue && <div className="mt-1 text-[11px] text-[#6B7280]">{subValue}</div>}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-4 w-1 rounded-full bg-[#6366F1]" />
      <span className="text-[13px] font-bold text-[#111827]">{children}</span>
    </div>
  );
}

function ChartShell({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E6E9EF] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
        <div>
          <div className="text-[13px] font-bold text-[#111827]">{title}</div>
          {subtitle && <div className="mt-0.5 text-[11px] text-[#9CA3AF]">{subtitle}</div>}
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CustomerMixCard({ newCount, returningCount }: { newCount: number; returningCount: number }) {
  const total = newCount + returningCount || 1;
  const newPct = Math.round((newCount / total) * 100);
  const retPct = 100 - newPct;

  return (
    <div className="rounded-2xl border border-[#E6E9EF] bg-white p-5 shadow-sm">
      <SectionHeading>Customer mix</SectionHeading>
      <div className="mt-1 text-[11px] text-[#9CA3AF]">New vs returning in period</div>

      {/* stacked bar */}
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        <div className="transition-all" style={{ width: `${newPct}%`, background: "#6366F1" }} />
        <div className="transition-all" style={{ width: `${retPct}%`, background: "#34D399" }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#6366F108] p-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#6366F1]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6366F1]">New</span>
          </div>
          <div className="mt-2 text-[24px] font-black text-[#111827]">{newCount}</div>
          <div className="text-[10px] text-[#9CA3AF]">{newPct}% of total</div>
        </div>
        <div className="rounded-xl bg-[#34D39908] p-3">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-[#059669]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#059669]">Returning</span>
          </div>
          <div className="mt-2 text-[24px] font-black text-[#111827]">{returningCount}</div>
          <div className="text-[10px] text-[#9CA3AF]">{retPct}% of total</div>
        </div>
      </div>
    </div>
  );
}

function StatusBreakdownCard({ items }: { items: Array<{ label: string; count: number }> }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="rounded-2xl border border-[#E6E9EF] bg-white p-5 shadow-sm">
      <SectionHeading>Status breakdown</SectionHeading>
      <div className="mt-3 space-y-2.5">
        {items.map((item) => {
          const color = getStatusColor(item.label);
          const pct = Math.round((item.count / max) * 100);
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#374151]">{item.label}</span>
                <span className="font-bold text-[#111827]">{item.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="py-4 text-center text-[12px] text-[#9CA3AF]">No breakdown data.</div>
        )}
      </div>
    </div>
  );
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-lg text-[12px]">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="font-semibold text-[#111827]">{name}</span>
      </div>
      <div className="mt-0.5 text-[#6B7280]">{value} orders</div>
    </div>
  );
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-lg text-[12px]">
      <div className="font-semibold text-[#111827]">{label}</div>
      <div className="mt-0.5 text-[#6B7280]">{payload[0].value} orders</div>
    </div>
  );
};

function OrderAnalysisPage() {
  const [date, setDate] = useState<DashboardDateState>(defaultDashboardDate("this_month"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [statusDistribution, setStatusDistribution] = useState<Array<{ status: string; count: number }>>([]);
  const [ordersOverTime, setOrdersOverTime] = useState<any>(null);

  const unwrap = (r: any) => (r && typeof r === "object" && "data" in r ? r.data : r);

  const isCustomReady = date.preset !== "custom" || (!!date.startDate && !!date.endDate);
  const apiParams = {
    groupBy: date.groupBy,
    ...(date.preset === "custom" ? { startDate: date.startDate, endDate: date.endDate } : {}),
  };

  const chartData = useMemo(() => {
    if (!ordersOverTime?.labels?.length) return [];
    return ordersOverTime.labels.map((label: string, index: number) => ({
      label,
      value: ordersOverTime.datasets?.[0]?.data?.[index] ?? 0,
    }));
  }, [ordersOverTime]);

  const pieData = useMemo(
    () =>
      statusDistribution.map((item) => ({
        name: item.status,
        value: item.count,
        color: getStatusColor(item.status),
      })),
    [statusDistribution]
  );

  const breakdownItems = useMemo(() => {
    if (!analytics?.orderStatusBreakdown) return [];
    return Object.entries(analytics.orderStatusBreakdown).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^(.)/, (m) => m.toUpperCase()),
      count: Number(value),
    }));
  }, [analytics]);

  const totalPie = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData]);

  const handleExportPDF = () => {
    if (!analytics) return;
    const label =
      date.preset === "custom" && date.startDate && date.endDate
        ? `${date.startDate} to ${date.endDate}`
        : date.preset.replace(/_/g, " ");
    exportOrderAnalyticsPDF({
      dateLabel: label,
      analytics,
      statusDistribution,
      ordersOverTime,
    });
  };

  const loadData = async () => {
    if (!isCustomReady) return;
    setLoading(true);
    setError(null);
    try {
      const [orderAnalyticsRes, statusDistributionRes, ordersOverTimeRes] = await Promise.all([
        dashboardService.getOrderAnalytics(apiParams),
        dashboardService.getOrderStatusDistribution(apiParams),
        dashboardService.getOrdersOverTime(apiParams),
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
  }, [date]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">Analytics</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#111827]">Order Analytics</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Monitor order performance, status distribution, and fulfillment trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardDateFilter value={date} onChange={setDate} />
          <button
            onClick={handleExportPDF}
            disabled={!analytics}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#6366F1] px-3 text-[12px] font-semibold text-white shadow-sm hover:bg-[#4F46E5] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button
            onClick={loadData}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#374151] shadow-sm hover:bg-[#F9FAFB] transition"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white py-16 text-[13px] text-[#9CA3AF] shadow-sm">
          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Loading order analytics…
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] px-5 py-4 text-[13px] font-medium text-[#B91C1C]">
          {error}
        </div>
      )}

      {!loading && analytics && (
        <div className="space-y-6">
          {/* ── KPI cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total orders"
              value={analytics.totalOrders ?? 0}
              subValue="All orders in period"
              icon={Package}
              accent="#6366F1"
            />
            <MetricCard
              label="Successful orders"
              value={analytics.totalSuccessfulOrders ?? 0}
              subValue="Paid and fulfilled"
              icon={CheckCircle2}
              accent="#10B981"
              trend="up"
            />
            <MetricCard
              label="Cancellation rate"
              value={`${analytics.cancellationRate?.toFixed(1) ?? 0}%`}
              subValue={`From ${analytics.totalOrders ?? 0} orders`}
              icon={ArrowDownRight}
              accent="#EF4444"
              trend="down"
            />
            <MetricCard
              label="Return rate"
              value={`${analytics.returnRate?.toFixed(1) ?? 0}%`}
              subValue="Returns + refunds"
              icon={ArrowUpRight}
              accent="#F59E0B"
            />
          </div>

          {/* ── Middle row: customer mix + breakdown + pie ── */}
          <div className="grid gap-4 xl:grid-cols-[1fr,1fr,1.4fr]">
            <CustomerMixCard
              newCount={analytics.newCustomersCount ?? 0}
              returningCount={analytics.returningCustomersCount ?? 0}
            />

            <StatusBreakdownCard items={breakdownItems} />

            {/* Pie chart */}
            <ChartShell
              title="Status distribution"
              subtitle="Share of orders by status"
              badge={
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#374151]">
                  {totalPie} total
                </span>
              }
            >
              <div className="relative h-[220px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[22px] font-black text-[#111827]">{totalPie}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">orders</div>
                </div>
              </div>

              {/* legend */}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
                    <span className="truncate text-[#6B7280]">{entry.name}</span>
                    <span className="ml-auto font-bold text-[#111827]">{entry.value}</span>
                  </div>
                ))}
              </div>
            </ChartShell>
          </div>

          {/* ── Bottom row: area chart + status table ── */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Orders over time */}
            <ChartShell
              title="Orders over time"
              subtitle="Trend for selected period"
              badge={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-semibold text-[#6366F1]">
                  <TrendingUp className="h-3 w-3" /> Trend
                </span>
              }
            >
              <div className="h-64">
                {chartData.length ? (
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="label" stroke="#D1D5DB" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#D1D5DB" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomAreaTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366F1"
                        fill="url(#orderGrad)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] text-[#9CA3AF]">
                    No trend data for this period.
                  </div>
                )}
              </div>
            </ChartShell>

            {/* Status table */}
            <ChartShell
              title="Status detail table"
              subtitle="Counts per order status"
              badge={
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#374151]">
                  {statusDistribution.length} statuses
                </span>
              }
            >
              <div className="overflow-hidden rounded-xl border border-[#F3F4F6]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#F9FAFB]">
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Status
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Count
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {statusDistribution.map((item) => {
                      const share = totalPie ? ((item.count / totalPie) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={item.status} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-4 py-2.5">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-[#111827]">{item.count}</td>
                          <td className="px-4 py-2.5 text-right text-[#6B7280]">{share}%</td>
                        </tr>
                      );
                    })}
                    {statusDistribution.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-[12px] text-[#9CA3AF]">
                          No status data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartShell>
          </div>
        </div>
      )}
    </div>
  );
}
