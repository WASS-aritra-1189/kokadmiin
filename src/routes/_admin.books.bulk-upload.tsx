import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, FileSpreadsheet, UploadCloud, AlertTriangle, X } from "lucide-react";

export const Route = createFileRoute("/_admin/books/bulk-upload")({ component: BulkUploadPage });

const previewRows = [
  { row: 2, isbn: "978-93-15423-01-1", title: "The Silent Cartographer", author: "M. Ellery Vance", price: 499, mrp: 599, stock: 24, status: "ok" as const },
  { row: 3, isbn: "978-93-15423-02-2", title: "Ledgers of the Small Kingdom", author: "Anisha Rao", price: 349, mrp: 449, stock: 12, status: "ok" as const },
  { row: 4, isbn: "978-93-15423-03-3", title: "Salt, Fat, Iron", author: "Priya Menon", price: 799, mrp: 999, stock: 0, status: "warn" as const, note: "Stock is 0 — will import as Out of stock" },
  { row: 5, isbn: "MISSING", title: "Grammar of Weather", author: "T. Okonkwo", price: 299, mrp: 399, stock: 40, status: "error" as const, note: "ISBN is required" },
  { row: 6, isbn: "978-93-15423-05-5", title: "A Field Guide to Grief", author: "Rowan Hale", price: 0, mrp: 349, stock: 15, status: "error" as const, note: "Selling price cannot be 0" },
  { row: 7, isbn: "978-93-15423-06-6", title: "Machines That Dream", author: "Yusuf Chen", price: 259, mrp: 299, stock: 88, status: "ok" as const },
];

function BulkUploadPage() {
  const [step, setStep] = useState(2);
  const [file] = useState({ name: "books-master-jul-2026.xlsx", size: "218 KB", rows: 1284 });

  const okCount = previewRows.filter((r) => r.status === "ok").length;
  const warnCount = previewRows.filter((r) => r.status === "warn").length;
  const errCount = previewRows.filter((r) => r.status === "error").length;

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Books</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Bulk upload</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Import thousands of new titles in one go via CSV, XLSX or ONIX 3.0.</p>
        </div>
        <a href="#" className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium flex items-center">Download template ↓</a>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white p-2 text-[12px]">
        {["Upload file", "Map columns", "Preview & validate", "Import"].map((s, i) => (
          <div key={s} className={"flex items-center gap-2 rounded-md px-3 py-1.5 " + (i === step ? "bg-[#111827] text-white" : i < step ? "bg-[#DCFCE7] text-[#166534]" : "text-[#6B7280]")}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px] font-semibold">{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,340px]">
        <div className="rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold">Preview &amp; validate</div>
              <div className="text-[11px] text-[#6B7280]">Only the first 6 of 1,284 rows are shown. Fix errors before importing.</div>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 font-medium text-[#166534]">{okCount} valid</span>
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 font-medium text-[#92400E]">{warnCount} warning</span>
              <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 font-medium text-[#991B1B]">{errCount} error</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#FAFAF9] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  <th className="px-3 py-2 text-left">ISBN</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Author</th>
                  <th className="px-3 py-2 text-right">MRP</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r) => (
                  <tr key={r.row} className="border-t border-[#F3F4F6]">
                    <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">{r.row}</td>
                    <td className={"px-3 py-2 font-mono text-[11px] " + (r.isbn === "MISSING" ? "text-[#EF4444]" : "text-[#4B5563]")}>{r.isbn}</td>
                    <td className="px-3 py-2 font-medium">{r.title}</td>
                    <td className="px-3 py-2 text-[#4B5563]">{r.author}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[#9CA3AF] line-through">₹{r.mrp}</td>
                    <td className={"px-3 py-2 text-right tabular-nums font-medium " + (r.price === 0 ? "text-[#EF4444]" : "")}>₹{r.price}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.stock}</td>
                    <td className="px-3 py-2">
                      {r.status === "ok" && <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#166534]"><CheckCircle2 className="h-3 w-3" />Ready</span>}
                      {r.status === "warn" && <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#92400E]" title={r.note}><AlertTriangle className="h-3 w-3" />Warning</span>}
                      {r.status === "error" && <span className="inline-flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-medium text-[#991B1B]" title={r.note}><X className="h-3 w-3" />{r.note}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-3">
            <button onClick={() => setStep(Math.max(0, step - 1))} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">← Back</button>
            <div className="flex items-center gap-2">
              <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">Download error report</button>
              <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">Import {okCount + warnCount} valid rows →</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Source file</div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#DBEAFE] text-[#1E40AF]"><FileSpreadsheet className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium">{file.name}</div>
                <div className="text-[11px] text-[#6B7280]">{file.rows.toLocaleString("en-IN")} rows · {file.size}</div>
              </div>
            </div>
            <button className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#E5E7EB] px-2 text-[12px] text-[#6B7280] hover:bg-[#FAFAF9]"><UploadCloud className="h-3.5 w-3.5" />Replace file</button>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Import options</div>
            <div className="space-y-2 text-[12px]">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Skip rows with errors</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Update existing SKUs by ISBN</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Publish as Active immediately</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Send email report when done</label>
            </div>
            <div className="mt-3">
              <label className="text-[11px] font-medium text-[#374151]">Assign default warehouse</label>
              <select className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
                <option>Mumbai Central</option><option>Delhi North</option><option>Bengaluru Hub</option><option>Chennai South</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 text-[11px] text-[#6B7280]">
            <div className="mb-1 font-medium text-[#111827]">Supported formats</div>
            CSV (UTF-8), XLSX, XLS, ONIX 3.0 XML — max 20 MB per file.
          </div>
        </div>
      </div>
    </div>
  );
}
