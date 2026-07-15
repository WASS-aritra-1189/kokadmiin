import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpDown, Search } from "lucide-react";
import { books, warehouses } from "@/mock/data";

export const Route = createFileRoute("/_admin/inventory/stock")({
  component: StockPage,
});

function StockPage() {
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const rows = useMemo(() => books.map((b) => {
    const per = warehouses.map((w, i) => Math.max(0, Math.round(b.stock * [0.55, 0.2, 0.15, 0.1][i])));
    const onHand = per.reduce((a, b) => a + b, 0);
    const reserved = Math.round(onHand * 0.08);
    const incoming = i(b.id) * 3;
    const available = Math.max(0, onHand - reserved);
    return { b, per, onHand, reserved, incoming, available };
  }), []);

  const filtered = rows.filter((r) => {
    if (onlyLow && r.available > r.b.reorder) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return r.b.title.toLowerCase().includes(s) || r.b.isbn.includes(q);
  });

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Inventory</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Stock across warehouses</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Live on-hand, reserved and available quantities per SKU.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">Stock audit</button>
          <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">+ Adjust stock</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {warehouses.map((w) => (
          <div key={w.id} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{w.city}</div>
            <div className="text-[14px] font-semibold">{w.name}</div>
            <div className="mt-2 text-[22px] font-semibold tabular-nums">{w.onHand.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-[#6B7280]">units on hand</div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SKU, title, ISBN…" className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]" />
          </div>
          <label className="flex items-center gap-1.5 text-[12px] text-[#374151]">
            <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
            Low stock only
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">SKU / Title</th>
                {warehouses.map((w) => <th key={w.id} className="px-3 py-2 text-right">{w.city}</th>)}
                <th className="px-3 py-2 text-right">Reserved</th>
                <th className="px-3 py-2 text-right">Incoming</th>
                <th className="px-3 py-2 text-right"><span className="inline-flex items-center gap-1">Available <ArrowUpDown className="h-3 w-3" /></span></th>
                <th className="px-3 py-2 text-right">Reorder</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ b, per, reserved, incoming, available }) => {
                const low = available <= b.reorder;
                return (
                  <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-6 rounded-sm shadow-sm" style={{ background: b.cover }} />
                        <div>
                          <div className="font-mono text-[10px] text-[#6B7280]">{b.id}</div>
                          <div className="font-medium">{b.title}</div>
                        </div>
                      </div>
                    </td>
                    {per.map((v, idx) => <td key={idx} className="px-3 py-2 text-right tabular-nums">{v}</td>)}
                    <td className="px-3 py-2 text-right tabular-nums text-[#6B7280]">{reserved}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[#0EA5E9]">+{incoming}</td>
                    <td className={"px-3 py-2 text-right tabular-nums font-semibold " + (low ? "text-[#EF4444]" : "text-[#111827]")}>
                      <span className="inline-flex items-center gap-1">
                        {low && <AlertTriangle className="h-3 w-3" />}
                        {available}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[#6B7280]">{b.reorder}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="rounded-md border border-[#E5E7EB] px-2 py-0.5 text-[11px]">Adjust</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function i(id: string) { return (parseInt(id.slice(-3), 10) || 0) % 20; }
