import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { books } from "@/mock/data";
import { Filter, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_admin/books/bulk-update")({ component: BulkUpdatePage });

function BulkUpdatePage() {
  const [scope, setScope] = useState("Category");
  const [op, setOp] = useState("Increase price by %");
  const preview = books.slice(0, 6);

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Books</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Bulk update</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Apply a single change to hundreds of SKUs at once — price adjustments, stock resets, category moves and status changes.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[380px,1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]"><Filter className="h-3 w-3" />Step 1 · Select scope</div>
            <label className="text-[11px] font-medium text-[#374151]">Filter by</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
              <option>Category</option><option>Publisher</option><option>Author</option><option>Format</option><option>Stock &lt; reorder</option><option>Custom saved segment</option>
            </select>
            <label className="mt-3 block text-[11px] font-medium text-[#374151]">Value</label>
            <input defaultValue="Fiction" className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]" />
            <label className="mt-3 block text-[11px] font-medium text-[#374151]">Additional filters</label>
            <div className="mt-1 space-y-2 text-[12px]">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Only Active titles</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Only titles with stock &gt; 0</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Exclude pre-orders</label>
            </div>
            <div className="mt-3 rounded-md bg-[#F9FAFB] p-2 text-[11px] text-[#374151]">
              <span className="font-semibold">218 titles</span> match your filters.
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]"><Wand2 className="h-3 w-3" />Step 2 · Choose operation</div>
            <select value={op} onChange={(e) => setOp(e.target.value)} className="h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
              <option>Increase price by %</option>
              <option>Decrease price by %</option>
              <option>Set selling price to</option>
              <option>Set MRP to</option>
              <option>Set reorder point</option>
              <option>Set stock quantity</option>
              <option>Change status</option>
              <option>Move to category</option>
              <option>Assign brand</option>
              <option>Update GST %</option>
              <option>Enable / disable free shipping</option>
            </select>

            <label className="mt-3 block text-[11px] font-medium text-[#374151]">Value</label>
            <div className="mt-1 flex items-center gap-2">
              <input defaultValue="7.5" className="h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px] tabular-nums" />
              <span className="text-[12px] text-[#6B7280]">%</span>
            </div>

            <label className="mt-3 block text-[11px] font-medium text-[#374151]">Rounding</label>
            <select className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
              <option>Round to nearest ₹1</option><option>Round to nearest ₹5</option><option>End in ₹99</option><option>No rounding</option>
            </select>

            <label className="mt-3 flex items-center gap-2 text-[12px]"><input type="checkbox" defaultChecked /> Schedule change for a future date</label>
            <label className="mt-2 flex items-center gap-2 text-[12px]"><input type="checkbox" defaultChecked /> Create audit log entry</label>
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold">Change preview</div>
              <div className="text-[11px] text-[#6B7280]">Showing 6 of 218 affected SKUs. Values are calculated live.</div>
            </div>
            <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">Apply to 218 titles →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#FAFAF9] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr>
                  <th className="px-3 py-2 text-left">SKU</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-right">Current price</th>
                  <th className="px-3 py-2 text-right">New price</th>
                  <th className="px-3 py-2 text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((b) => {
                  const next = Math.round(b.price * 1.075);
                  return (
                    <tr key={b.id} className="border-t border-[#F3F4F6]">
                      <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">{b.id}</td>
                      <td className="px-3 py-2 font-medium">{b.title}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#6B7280]">₹{b.price}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-[#111827]">₹{next}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#10B981]">+₹{next - b.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#F3F4F6] bg-[#FAFAF9] px-4 py-2 text-[11px] text-[#6B7280]">
            A dry-run report will be emailed to <span className="font-medium text-[#111827]">admin@bookstore.co</span> before changes go live.
          </div>
        </div>
      </div>
    </div>
  );
}
