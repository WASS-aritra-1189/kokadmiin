import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart } from "recharts";
import { ArrowDownRight, ArrowUpRight, Package, ShoppingBag, Wallet, AlertTriangle } from "lucide-react";
import { books, currency, kpi, orders, revenueSeries } from "@/mock/data";

export const Route = createFileRoute("/_admin/dashboard/")({
  component: DashboardPage,
});

const statusColors: Record<string, string> = {
  New: "#4F46E5", Processing: "#F59E0B", Packed: "#8B5CF6",
  Shipped: "#0EA5E9", Delivered: "#10B981", Returned: "#EF4444", Cancelled: "#6B7280",
};

function DashboardPage() {
  const donutData = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => ((acc[o.status] = (acc[o.status] ?? 0) + 1), acc), {}),
  ).map(([name, value]) => ({ name, value }));

  const topBooks = [...books].sort((a, b) => b.price * (100 - b.stock) - a.price * (100 - a.stock)).slice(0, 6);
  const recent = orders.slice(0, 6);
  const low = books.filter((b) => b.stock <= 10).slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Overview</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Real-time performance across your bookstore.</p>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <select className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px]"><option>Last 14 days</option><option>Last 30 days</option><option>This quarter</option></select>
          <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 font-medium text-[#374151] hover:bg-[#F9FAFB]">Export</button>
          <button className="h-8 rounded-md bg-[#111827] px-3 font-medium text-white hover:bg-[#1F2937]">Create order</button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Gross revenue" value={currency(kpi.revenue)} delta={kpi.revenueDelta} icon={Wallet} tint="#4F46E5" />
        <Kpi label="Orders" value={kpi.orders.toLocaleString("en-IN")} delta={kpi.ordersDelta} icon={ShoppingBag} tint="#0EA5E9" />
        <Kpi label="Avg. order value" value={currency(kpi.aov)} delta={kpi.aovDelta} icon={Package} tint="#10B981" />
        <Kpi label="Low-stock SKUs" value={String(kpi.lowStock)} delta={kpi.lowStockDelta} icon={AlertTriangle} tint="#F59E0B" invertDelta />
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
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} formatter={(v: number) => currency(v)} />
                <Area type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Orders by status" subtitle={`${orders.length} orders`} />
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
              {topBooks.map((b) => (
                <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-6 rounded-sm shadow-sm" style={{ background: b.cover }} />
                      <div>
                        <div className="font-medium text-[#111827]">{b.title}</div>
                        <div className="text-[10px] text-[#6B7280]">{b.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[#4B5563]">{b.category}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{currency(b.price)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[#4B5563]">{b.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Low-stock alerts" subtitle={`${low.length} items`} />
          <div className="divide-y divide-[#F3F4F6]">
            {low.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="h-9 w-7 flex-shrink-0 rounded-sm" style={{ background: b.cover }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium">{b.title}</div>
                  <div className="text-[10px] text-[#6B7280]">{b.isbn}</div>
                </div>
                <div className={"tabular-nums text-[12px] font-semibold " + (b.stock === 0 ? "text-[#EF4444]" : "text-[#F59E0B]")}>{b.stock}</div>
              </div>
            ))}
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
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2 font-mono text-[11px] text-[#4F46E5]">{o.id}</td>
                  <td className="px-4 py-2"><div className="font-medium">{o.customer}</div><div className="text-[10px] text-[#6B7280]">{o.email}</div></td>
                  <td className="px-4 py-2 text-[#4B5563]">{o.payment}</td>
                  <td className="px-4 py-2"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-2 text-right tabular-nums">{o.items}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{currency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, icon: Icon, tint, invertDelta }: { label: string; value: string; delta: number; icon: any; tint: string; invertDelta?: boolean }) {
  const positive = invertDelta ? delta < 0 : delta > 0;
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">{label}</div>
        <div className="rounded-md p-1.5" style={{ background: tint + "15", color: tint }}><Icon className="h-3.5 w-3.5" /></div>
      </div>
      <div className="mt-2 text-[22px] font-semibold tracking-tight tabular-nums">{value}</div>
      <div className={"mt-1 flex items-center gap-1 text-[11px] font-medium " + (positive ? "text-[#10B981]" : "text-[#EF4444]")}>{positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(delta)}%<span className="font-normal text-[#9CA3AF]">vs last period</span></div>
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

