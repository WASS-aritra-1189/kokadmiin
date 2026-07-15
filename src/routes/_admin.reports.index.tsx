import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { books, currency, orders, revenueSeries } from "@/mock/data";

export const Route = createFileRoute("/_admin/reports/")({
  component: ReportsHub,
});

const TABS = ["Sales", "Inventory", "Customers", "Tax", "Courier"] as const;

function ReportsHub() {
  const [tab, setTab] = useState<typeof TABS[number]>("Sales");
  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Reports</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Reports hub</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Sales, inventory, customer, tax and courier analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px]"><option>This month</option><option>Last month</option><option>This quarter</option><option>YTD</option></select>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium"><Download className="h-3.5 w-3.5" />Export CSV</button>
        </div>
      </div>

      <div className="mt-5 flex gap-1 border-b border-[#E5E7EB]">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={"px-3 py-2 text-[12px] font-medium border-b-2 " + (tab === t ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#6B7280] hover:text-[#111827]")}>{t}</button>
        ))}
      </div>

      {tab === "Sales" && <SalesTab />}
      {tab === "Inventory" && <InventoryTab />}
      {tab !== "Sales" && tab !== "Inventory" && (
        <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-10 text-center text-[13px] text-[#6B7280]">
          {tab} report — coming soon.
        </div>
      )}
    </div>
  );
}

function SalesTab() {
  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Gross sales" value={currency(1284900)} sub="+12.4%" />
        <Kpi label="Net sales" value={currency(1194500)} sub="+11.2%" />
        <Kpi label="Refunds" value={currency(38400)} sub="-3.1%" positive />
        <Kpi label="Orders" value={String(orders.length)} sub="+8.1%" />
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Revenue trend</div>
        <div className="h-64 px-2 pb-2">
          <ResponsiveContainer>
            <LineChart data={revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="d" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>`₹${Math.round(v/1000)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => currency(v)} />
              <Line type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Top titles by revenue</div>
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase text-[#6B7280]"><tr className="border-b border-[#E5E7EB]"><th className="px-4 py-2 text-left">Title</th><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-right">Units</th><th className="px-4 py-2 text-right">Revenue</th></tr></thead>
          <tbody>
            {books.slice(0, 8).map((b, i) => (
              <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0">
                <td className="px-4 py-2 font-medium">{b.title}</td>
                <td className="px-4 py-2 text-[#4B5563]">{b.category}</td>
                <td className="px-4 py-2 text-right tabular-nums">{120 - i * 9}</td>
                <td className="px-4 py-2 text-right font-medium tabular-nums">{currency((120 - i * 9) * b.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryTab() {
  const data = books.slice(0, 10).map((b) => ({ name: b.title.split(" ").slice(0,2).join(" "), v: b.stock }));
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#F3F4F6] px-4 py-3 text-[13px] font-semibold">Stock levels — top titles</div>
        <div className="h-64 px-2 pb-2">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="v" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, positive }: { label: string; value: string; sub: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{label}</div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums">{value}</div>
      <div className={"mt-1 text-[11px] font-medium " + (sub.startsWith("-") && !positive ? "text-[#EF4444]" : "text-[#10B981]")}>{sub}</div>
    </div>
  );
}
