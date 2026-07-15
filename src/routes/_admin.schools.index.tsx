import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { schoolService, type School } from "@/services/school.service";

export const Route = createFileRoute("/_admin/schools/")({ component: Page });

const LIMIT = 10;

// SchoolStatus: PENDING | ACTIVE | INACTIVE | REJECTED
const STATUS_COLOR: Record<string, string> = {
  ACTIVE:   "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]",
  PENDING:  "bg-[#FEF9C3] text-[#854D0E] hover:bg-[#FEF08A]",
  INACTIVE: "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]",
  REJECTED: "bg-[#FEE2E2] text-[#991B1B] cursor-default",
};

// Toggle: ACTIVE → INACTIVE, anything else → ACTIVE
function nextStatus(current: string): string {
  return current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
}

function Page() {
  const [items, setItems] = useState<School[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: School | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await schoolService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleStatusToggle = async (item: School) => {
    if (item.status === "REJECTED") return; // rejected can't be toggled
    await schoolService.changeStatus(item.id, nextStatus(item.status));
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this school?")) return;
    await schoolService.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Schools</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Schools</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Manage schools associated with book bunches.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="h-3.5 w-3.5" />New school
        </button>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {[
          ["Total",    total],
          ["Active",   items.filter(i => i.status === "ACTIVE").length],
          ["Pending",  items.filter(i => i.status === "PENDING").length],
          ["Inactive", items.filter(i => i.status === "INACTIVE").length],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{l}</div>
            <div className="mt-1 text-[22px] font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search schools…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-4 py-2 text-left">School</th>
                <th className="px-4 py-2 text-left">City</th>
                <th className="px-4 py-2 text-left">State</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">No schools found.</td></tr>}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.city ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.state ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.phone ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className={"rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors " + (STATUS_COLOR[item.status] ?? "bg-[#F3F4F6] text-[#4B5563]")}
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSheet({ open: true, item })} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="rounded-md border border-[#FEE2E2] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div>Showing <span className="font-medium text-[#111827]">{items.length}</span> of {total}</div>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={"rounded-md px-2 py-1 " + (p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {sheet.open && (
        <SchoolSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(); }}
        />
      )}
    </div>
  );
}

// ─── School Sheet ─────────────────────────────────────────────────────────────

function SchoolSheet({ item, onClose, onSaved }: { item: School | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "",
    email: item?.email ?? "",
    phone: item?.phone ?? "",
    city: item?.city ?? "",
    state: item?.state ?? "",
    pincode: item?.pincode ?? "",
    address: item?.address ?? "",
    description: item?.description ?? "",
    status: item?.status ?? "PENDING",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inp = "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        ...(form.email ? { email: form.email } : {}),
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.city ? { city: form.city } : {}),
        ...(form.state ? { state: form.state } : {}),
        ...(form.pincode ? { pincode: form.pincode } : {}),
        ...(form.address ? { address: form.address } : {}),
        ...(form.description ? { description: form.description } : {}),
      };
      if (isEdit) {
        // Update fields first
        await schoolService.update(item.id, payload);
        // Change status separately if it changed
        if (form.status !== item.status) {
          await schoolService.changeStatus(item.id, form.status);
        }
      } else {
        await schoolService.create(payload);
      }
      onSaved();
    } catch (err: any) {
      const msg = err.response?.data?.data?.errors?.[0] ?? err.response?.data?.message ?? "Something went wrong";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit school" : "New school"}</div>
            <div className="text-[15px] font-semibold">{form.name || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">School name *</label>
              <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Delhi Public School" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="school@example.com" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">City</label>
                <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Mumbai" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">State</label>
                <input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Maharashtra" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Pincode</label>
                <input value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" className={inp} />
              </div>
              {isEdit && (
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Status</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address…" className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5]" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes…" className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5]" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151]">Cancel</button>
            <button type="submit" disabled={saving} className="h-8 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
