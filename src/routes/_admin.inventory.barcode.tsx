import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { books } from "@/mock/data";
import { Printer, QrCode } from "lucide-react";

export const Route = createFileRoute("/_admin/inventory/barcode")({ component: BarcodePage });

export function BarcodePage() {
  const [format, setFormat] = useState("CODE-128");
  const [size, setSize] = useState("38 × 25 mm (3 across)");
  const [copies, setCopies] = useState(3);
  const [selected, setSelected] = useState<Set<string>>(new Set(books.slice(0, 4).map((b) => b.id)));

  const selectedBooks = books.filter((b) => selected.has(b.id));
  const totalLabels = useMemo(() => selectedBooks.length * copies, [selectedBooks, copies]);

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Inventory</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Barcode &amp; QR labels</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Generate scannable labels for shelf, receiving and PoS workflows. Supports EAN-13, CODE-128, ITF-14 and QR.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium">Download PDF</button>
          <button className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white"><Printer className="h-3.5 w-3.5" />Print {totalLabels} labels</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[340px,1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Label settings</div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-[#374151]">Symbology</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
                  <option>EAN-13</option><option>CODE-128</option><option>ITF-14</option><option>QR Code</option><option>Data Matrix</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#374151]">Label size / sheet</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
                  <option>38 × 25 mm (3 across)</option>
                  <option>50 × 30 mm (2 across)</option>
                  <option>70 × 42 mm (Avery L7163)</option>
                  <option>4 × 6 inch — Thermal roll</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#374151]">Copies per SKU</label>
                <input type="number" value={copies} onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value || "1")))} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]" />
              </div>
              <div className="space-y-2 rounded-md border border-[#E5E7EB] p-3 text-[12px]">
                <div className="text-[11px] font-medium uppercase text-[#6B7280]">Show on label</div>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Title (truncated)</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Author</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> MRP</label>
                <label className="flex items-center gap-2"><input type="checkbox" /> Bin / shelf location</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> ISBN under barcode</label>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Scanner test</div>
            <p className="text-[11px] text-[#6B7280]">Scan any label into the box to verify decoding.</p>
            <input placeholder="Scan a barcode…" className="mt-2 h-8 w-full rounded-md border border-[#E5E7EB] px-2 font-mono text-[12px]" />
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold">Select SKUs</div>
              <div className="text-[11px] text-[#6B7280]">{selected.size} selected · {totalLabels} labels queued</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set(books.map((b) => b.id)))} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px]">Select all</button>
              <button onClick={() => setSelected(new Set())} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px]">Clear</button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#FAFAF9] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr><th className="w-8 px-3 py-2" /><th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">ISBN</th><th className="px-3 py-2 text-right">MRP</th></tr>
              </thead>
              <tbody>
                {books.slice(0, 12).map((b) => (
                  <tr key={b.id} className="border-t border-[#F3F4F6]">
                    <td className="px-3 py-2"><input type="checkbox" checked={selected.has(b.id)} onChange={() => setSelected((s) => { const n = new Set(s); n.has(b.id) ? n.delete(b.id) : n.add(b.id); return n; })} /></td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">{b.id}</td>
                    <td className="px-3 py-2 font-medium">{b.title}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">{b.isbn}</td>
                    <td className="px-3 py-2 text-right tabular-nums">₹{b.mrp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#F3F4F6] p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Preview</div>
            <div className="grid grid-cols-3 gap-3">
              {selectedBooks.slice(0, 6).map((b) => (
                <div key={b.id} className="flex flex-col rounded-md border border-[#E5E7EB] p-2">
                  <div className="truncate text-[10px] font-semibold">{b.title}</div>
                  <div className="text-[9px] text-[#6B7280]">{b.author}</div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    {format === "QR Code" ? (
                      <div className="grid h-14 w-14 flex-shrink-0 grid-cols-6 grid-rows-6 gap-[1px] bg-[#111827] p-[2px]">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className={((i * 7 + b.isbn.length) % 3) === 0 ? "bg-white" : "bg-[#111827]"} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-10 flex-1 items-end gap-[1px]">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div key={i} className="bg-[#111827]" style={{ width: 2, height: (i * 7 + b.isbn.charCodeAt(i % b.isbn.length)) % 2 === 0 ? "100%" : "70%" }} />
                        ))}
                      </div>
                    )}
                    <div className="text-right text-[9px] font-medium tabular-nums">₹{b.mrp}</div>
                  </div>
                  <div className="mt-1 truncate font-mono text-[8px] text-[#6B7280]">{b.isbn}</div>
                </div>
              ))}
              {selectedBooks.length === 0 && (
                <div className="col-span-3 flex items-center justify-center gap-2 rounded-md border border-dashed border-[#E5E7EB] p-6 text-[12px] text-[#6B7280]">
                  <QrCode className="h-4 w-4" /> Select SKUs to generate labels.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
