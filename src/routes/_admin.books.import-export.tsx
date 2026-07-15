import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, FileSpreadsheet, RefreshCcw, Clock } from "lucide-react";

export const Route = createFileRoute("/_admin/books/import-export")({ component: ImportExportPage });

const history = [
  { id: "JOB-8814", kind: "Import", file: "books-master-jul-2026.xlsx", format: "XLSX", rows: 1284, status: "Completed", user: "Neha K.", when: "Today, 09:12" },
  { id: "JOB-8813", kind: "Export", file: "catalog-active-2026-07-07.csv", format: "CSV", rows: 4218, status: "Completed", user: "Aditya R.", when: "Today, 08:04" },
  { id: "JOB-8812", kind: "Import", file: "reprints-onix.xml", format: "ONIX 3.0", rows: 214, status: "Completed", user: "Meera I.", when: "Yesterday" },
  { id: "JOB-8811", kind: "Export", file: "gst-invoices-jun.csv", format: "CSV", rows: 1842, status: "Completed", user: "Auto (scheduler)", when: "1 Jul, 03:00" },
  { id: "JOB-8810", kind: "Import", file: "bulk-price-update.csv", format: "CSV", rows: 812, status: "Failed", user: "Aarav S.", when: "28 Jun" },
];

const scheduled = [
  { name: "Daily GST invoice export", cadence: "Every day · 03:00 IST", channel: "SFTP → tally.bookstore.co", next: "In 6 hours" },
  { name: "Weekly stock snapshot", cadence: "Mon · 06:00", channel: "Email → ops@bookstore.co", next: "In 3 days" },
  { name: "Publisher royalty export", cadence: "1st of month · 10:00", channel: "S3 → s3://royalties/", next: "In 25 days" },
];

export function ImportExportPage() {
  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Books</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Import &amp; export</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Move catalog data in and out — one-off uploads and scheduled feeds to partners or marketplaces.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
          <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold"><Upload className="h-4 w-4 text-[#4F46E5]" />Import catalog</div>
          <p className="text-[11px] text-[#6B7280]">Upload new titles, price updates or stock counts. Accepts CSV, XLSX and ONIX 3.0.</p>

          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#FAFAF9] p-8 text-center">
            <FileSpreadsheet className="mb-2 h-6 w-6 text-[#6B7280]" />
            <div className="text-[13px] font-medium">Drop a file here or click to browse</div>
            <div className="mt-1 text-[11px] text-[#6B7280]">Max 20 MB · UTF-8 encoding</div>
            <button className="mt-3 h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">Select file</button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a className="rounded-md border border-[#E5E7EB] p-3 text-[12px] hover:bg-[#F9FAFB]">
              <div className="font-medium">CSV template</div>
              <div className="mt-0.5 text-[11px] text-[#6B7280]">37 columns · sample data</div>
            </a>
            <a className="rounded-md border border-[#E5E7EB] p-3 text-[12px] hover:bg-[#F9FAFB]">
              <div className="font-medium">XLSX template</div>
              <div className="mt-0.5 text-[11px] text-[#6B7280]">With dropdowns &amp; validation</div>
            </a>
            <a className="rounded-md border border-[#E5E7EB] p-3 text-[12px] hover:bg-[#F9FAFB]">
              <div className="font-medium">ONIX 3.0 sample</div>
              <div className="mt-0.5 text-[11px] text-[#6B7280]">Publisher metadata feed</div>
            </a>
            <a className="rounded-md border border-[#E5E7EB] p-3 text-[12px] hover:bg-[#F9FAFB]">
              <div className="font-medium">Column mapping guide</div>
              <div className="mt-0.5 text-[11px] text-[#6B7280]">PDF · 4 pages</div>
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
          <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold"><Download className="h-4 w-4 text-[#10B981]" />Export catalog</div>
          <p className="text-[11px] text-[#6B7280]">Generate a data extract on demand. Applies your current filters and columns.</p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-[11px] font-medium text-[#374151]">Dataset</label>
              <select className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
                <option>All books</option><option>Active books only</option><option>Out of stock</option><option>Low stock (below reorder)</option><option>Recently updated (7 days)</option><option>By category…</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#374151]">Format</label>
                <select className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
                  <option>CSV</option><option>XLSX</option><option>JSON</option><option>ONIX 3.0 XML</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#374151]">Delivery</label>
                <select className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-[12px]">
                  <option>Download now</option><option>Email me a link</option><option>Push to S3</option><option>Push to SFTP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#374151]">Columns</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["ISBN", "Title", "Author", "Category", "Format", "MRP", "Price", "Stock", "Warehouse", "GST%", "HSN", "Publisher", "Weight", "URL"].map((c, i) => (
                  <span key={c} className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (i < 10 ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#F3F4F6] text-[#6B7280]")}>{c}</span>
                ))}
              </div>
            </div>
            <button className="mt-2 h-9 w-full rounded-md bg-[#111827] text-[13px] font-medium text-white">Generate export</button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
          <div>
            <div className="text-[13px] font-semibold">Recent jobs</div>
            <div className="text-[11px] text-[#6B7280]">Latest 90 days of imports and exports.</div>
          </div>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px]"><RefreshCcw className="h-3.5 w-3.5" />Refresh</button>
        </div>
        <table className="w-full text-[12px]">
          <thead className="bg-[#FAFAF9] text-[10px] uppercase tracking-wider text-[#6B7280]">
            <tr>
              <th className="px-3 py-2 text-left">Job</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">File</th>
              <th className="px-3 py-2 text-right">Rows</th>
              <th className="px-3 py-2 text-left">By</th>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-t border-[#F3F4F6]">
                <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">{h.id}</td>
                <td className="px-3 py-2"><span className={"rounded-md px-2 py-0.5 text-[10px] font-medium " + (h.kind === "Import" ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#DCFCE7] text-[#166534]")}>{h.kind}</span></td>
                <td className="px-3 py-2">
                  <div className="font-medium">{h.file}</div>
                  <div className="text-[10px] text-[#6B7280]">{h.format}</div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{h.rows.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2 text-[#4B5563]">{h.user}</td>
                <td className="px-3 py-2 text-[#6B7280]">{h.when}</td>
                <td className="px-3 py-2">
                  <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (h.status === "Completed" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]")}>{h.status}</span>
                </td>
                <td className="px-3 py-2 text-right"><button className="rounded-md border border-[#E5E7EB] px-2 py-0.5 text-[11px]">View log</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
          <div>
            <div className="text-[13px] font-semibold">Scheduled exports</div>
            <div className="text-[11px] text-[#6B7280]">Recurring feeds pushed to marketplaces, analytics or partners.</div>
          </div>
          <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">+ New schedule</button>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {scheduled.map((s) => (
            <div key={s.name} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F3F4F6] text-[#4F46E5]"><Clock className="h-4 w-4" /></div>
                <div>
                  <div className="text-[13px] font-medium">{s.name}</div>
                  <div className="text-[11px] text-[#6B7280]">{s.cadence} · {s.channel}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-[#6B7280]">Next run · <span className="font-medium text-[#111827]">{s.next}</span></span>
                <button className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px]">Edit</button>
                <button className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#EF4444]">Pause</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
