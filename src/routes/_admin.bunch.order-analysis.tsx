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
import { ChartNoAxesCombined, CircleDollarSign, Package, RefreshCcw, RotateCcw, ShoppingCart, TrendingUp, Users } from "lucide-react";
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
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);

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
