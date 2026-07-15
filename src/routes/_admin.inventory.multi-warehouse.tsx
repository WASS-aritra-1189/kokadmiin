import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { books, warehouses } from "@/mock/data";
import { ArrowRightLeft, Search } from "lucide-react";

export const Route = createFileRoute("/_admin/inventory/multi-warehouse")({ component: MultiWarehousePage });

export function MultiWarehousePage() {
  const [q, setQ] = useState("");
  const rows = books.slice(0, 12).map((b) => {
    const per = warehouses.map((_, i) => Math.max(0, Math.round(b.stock * [0.55, 0.2, 0.15, 0.1][i])));
    return { b, per, total: per.reduce((a, c) => a + c, 0) };
  }).filter((r) => !q || r.b.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Inventory</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Multi-warehouse routing</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Rules that decide which warehouse ships each order. Balance stock across locations and optimise for cost or speed.</p>
        </div>
        <button className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white"><ArrowRightLeft className="h-3.5 w-3.5" />+ Transfer stock</button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[380px,1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Fulfilment strategy</div>
            <div className="space-y-2">
              {[
                ["Nearest to customer", "Route by pincode → warehouse distance", true],
                ["Highest stock", "Prefer the warehouse with the most units", false],
                ["Lowest shipping cost", "Compare live courier rates before assigning", false],
                ["Split across warehouses", "Allow multi-shipment orders when needed", true],
              ].map(([n, d, on]) => (
                <label key={n as string} className={"flex items-start gap-2 rounded-md border p-2 text-[12px] " + (on ? "border-[#4F46E5] bg-[#EEF2FF]" : "border-[#E5E7EB]")}>
                  <input type="checkbox" defaultChecked={on as boolean} className="mt-0.5" />
                  <div>
                    <div className="font-medium">{n}</div>
                    <div className="text-[11px] text-[#6B7280]">{d}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Zone → warehouse mapping</div>
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase text-[#6B7280]">
                <tr><th className="py-1 text-left">Zone</th><th className="py-1 text-left">Primary</th><th className="py-1 text-left">Fallback</th></tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {[
                  ["West", "Mumbai Central", "Delhi North"],
                  ["North", "Delhi North", "Mumbai Central"],
                  ["South", "Bengaluru Hub", "Chennai South"],
                  ["East", "Delhi North", "Bengaluru Hub"],
                  ["North-East", "Delhi North", "Chennai South"],
                ].map(([z, p, f]) => (
                  <tr key={z}><td className="py-1.5">{z}</td><td className="py-1.5"><select defaultValue={p} className="h-7 w-full rounded-md border border-[#E5E7EB] px-1 text-[11px]"><option>{p}</option><option>{f}</option></select></td><td className="py-1.5"><select defaultValue={f} className="h-7 w-full rounded-md border border-[#E5E7EB] px-1 text-[11px]"><option>{f}</option><option>{p}</option></select></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold">Live stock matrix</div>
              <div className="text-[11px] text-[#6B7280]">SKU × warehouse. Cells shaded red are below reorder point.</div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles…" className="h-8 w-56 rounded-md border border-[#E5E7EB] pl-8 pr-2 text-[12px]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#FAFAF9] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr>
                  <th className="px-3 py-2 text-left">Title</th>
                  {warehouses.map((w) => <th key={w.id} className="px-3 py-2 text-right">{w.city}</th>)}
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ b, per, total }) => (
                  <tr key={b.id} className="border-t border-[#F3F4F6]">
                    <td className="px-3 py-2">
                      <div className="font-medium">{b.title}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{b.id}</div>
                    </td>
                    {per.map((v, i) => (
                      <td key={i} className="px-3 py-2 text-right">
                        <input defaultValue={v} className={"h-7 w-16 rounded-md border px-2 text-right text-[12px] tabular-nums " + (v <= b.reorder ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]" : "border-[#E5E7EB]")} />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{total}</td>
                    <td className="px-3 py-2 text-right"><button className="rounded-md border border-[#E5E7EB] px-2 py-0.5 text-[11px]">Transfer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-2 text-[11px] text-[#6B7280]">
            <div>Edits are staged locally. Click Save changes to sync.</div>
            <button className="h-7 rounded-md bg-[#111827] px-3 text-[11px] font-medium text-white">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
