import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, TrendingUp, TrendingDown, AlertTriangle, XCircle, Zap, Clock } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";

export const Route = createFileRoute("/_admin/dashboard/product-analytics")({
  component: ProductAnalyticsPage,
});

const groupOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Analytics</div>
      <h1 className="mt-1 text-[22px] font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">{subtitle}</p>
    </div>
  );
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
      {subValue && <div className="mt-1 text-[11px] text-[#6B7280]">{subValue}</div>}
    </div>
  );
}

function ProductTable({ title, data, type }: { title: string; data: any[]; type: "stock" | "sales" }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="mb-3 text-[12px] font-semibold text-[#374151]">{title}</div>
        <div className="py-8 text-center text-[12px] text-[#9CA3AF]">No data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#F3F4F6] px-4 py-3">
        <div className="text-[12px] font-semibold text-[#374151]">{title}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="bg-[#FAFAFA] text-[10px] uppercase text-[#6B7280]">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              {type === "sales" && <th className="px-4 py-2 text-right">Sold</th>}
              {type === "sales" && <th className="px-4 py-2 text-right">Revenue</th>}
              {type === "stock" && <th className="px-4 py-2 text-right">Stock</th>}
              {type === "stock" && <th className="px-4 py-2 text-right">Price</th>}
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-t border-[#F3F4F6]">
                <td className="px-4 py-2">
                  <div className="font-medium text-[#111827]">{item.title || "—"}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{item.bookId?.slice(0, 8)}...</div>
                </td>
                {type === "sales" && (
                  <>
                    <td className="px-4 py-2 text-right font-medium">{item.totalSold ?? 0}</td>
                    <td className="px-4 py-2 text-right font-medium">₹{Number(item.revenue || 0).toLocaleString("en-IN")}</td>
                  </>
                )}
                {type === "stock" && (
                  <>
                    <td className={`px-4 py-2 text-right font-medium ${item.stock === 0 ? "text-[#EF4444]" : item.stock <= 10 ? "text-[#F59E0B]" : ""}`}>
                      {item.stock}
                    </td>
                    <td className="px-4 py-2 text-right">₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                  </>
                )}
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    item.status === "ACTIVE" ? "bg-[#DCFCE7] text-[#166534]" :
                    item.status === "DELETED" ? "bg-[#FEE2E2] text-[#991B1B]" :
                    "bg-[#F3F4F6] text-[#4B5563]"
                  }`}>
                    {item.status || "ACTIVE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesTable({ title, data }: { title: string; data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="mb-3 text-[12px] font-semibold text-[#374151]">{title}</div>
        <div className="py-8 text-center text-[12px] text-[#9CA3AF]">No data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#F3F4F6] px-4 py-3">
        <div className="text-[12px] font-semibold text-[#374151]">{title}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="bg-[#FAFAFA] text-[10px] uppercase text-[#6B7280]">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-right">Total Sold</th>
              <th className="px-4 py-2 text-right">Daily Avg</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-t border-[#F3F4F6]">
                <td className="px-4 py-2">
                  <div className="font-medium text-[#111827]">{item.title || "—"}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{item.bookId?.slice(0, 8)}...</div>
                </td>
                <td className="px-4 py-2 text-right font-medium">{item.totalSold ?? 0}</td>
                <td className="px-4 py-2 text-right">{item.dailyAvg ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductAnalyticsPage() {
  const [groupBy, setGroupBy] = useState("week");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const unwrap = (r: any) => (r && typeof r === 'object' && 'data' in r ? r.data : r);

  const groupByValue = groupBy === 'last_week' ? 'week' : groupBy === 'this_month' ? 'month' : groupBy;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getProductAnalytics({ groupBy: groupByValue });
      setData(unwrap(res));
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [groupByValue]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <PageHeader title="Product Analytics" subtitle="Track product performance, stock levels, and sales velocity." />
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px]"
        >
          {groupOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading && <div className="py-12 text-center text-[12px] text-[#6B7280]">Loading...</div>}
      {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>}
      
      {data && !loading && (
        <>
          {/* KPIs */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Best Seller" value={data.bestSelling?.[0]?.title?.slice(0, 20) || "—"} subValue={`${data.bestSelling?.[0]?.totalSold || 0} sold`} icon={TrendingUp} color="#10B981" />
            <KpiCard label="Worst Seller" value={data.worstSelling?.[0]?.title?.slice(0, 20) || "—"} subValue={`${data.worstSelling?.[0]?.totalSold || 0} sold`} icon={TrendingDown} color="#EF4444" />
            <KpiCard label="Low Stock Items" value={data.lowStock?.length || 0} icon={AlertTriangle} color="#F59E0B" />
            <KpiCard label="Out of Stock" value={data.outOfStock?.length || 0} icon={XCircle} color="#DC2626" />
          </div>

          {/* Stock Status */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ProductTable title="Low Stock Products (1-10)" data={data.lowStock || []} type="stock" />
            <ProductTable title="Out of Stock Products" data={data.outOfStock?.filter((b: any) => b.status !== "DELETED") || []} type="stock" />
          </div>

          {/* Sales Performance */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ProductTable title="Best Selling Products" data={data.bestSelling || []} type="sales" />
            <ProductTable title="Top 10 by Revenue" data={data.top10ByRevenue || []} type="sales" />
          </div>

          {/* Sales Velocity */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <SalesTable title="Fast Moving Products (Daily Avg)" data={data.fastMoving || []} />
            <SalesTable title="Slow Moving Products (Daily Avg)" data={data.slowMoving || []} />
          </div>

          {/* Period Info */}
          <div className="mt-6 text-[11px] text-[#9CA3AF]">
            Period: {data.period?.from?.slice(0, 10)} to {data.period?.to?.slice(0, 10)}
          </div>
        </>
      )}
    </div>
  );
}
