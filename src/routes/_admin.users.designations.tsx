import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, X, Edit3, Trash2 } from "lucide-react";
import { designationService, type Designation, type DesignationPayload } from "@/services/designation.service";

export const Route = createFileRoute("/_admin/users/designations")({ component: DesignationsPage });

const LIMIT = 12;

function DesignationsPage() {
  const [items, setItems] = useState<Designation[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: Designation | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await designationService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleStatusToggle = async (item: Designation) => {
    const next = item.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE";
    await designationService.changeStatus(item.id, next);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this designation?")) return;
    await designationService.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Users & Admin</div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Designations</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Manage staff designations, descriptions, and active status for your admin workspace.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#1F2937]"
        >
          <Plus className="h-4 w-4" /> New designation
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#F3F4F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search designations…"
              className="h-10 w-full rounded-full border border-[#E5E7EB] bg-white pl-10 pr-4 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div className="text-[12px] text-[#6B7280]">{items.length} of {total} designations</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] table-auto">
            <thead className="bg-[#FAFAFB] text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#6B7280]">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#6B7280]">No designations found.</td></tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 font-semibold text-[#111827]">{item.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{item.description || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className={
                        "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors " +
                        (item.status === "ACTIVE"
                          ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                          : item.status === "DELETED"
                          ? "bg-[#FEE2E2] text-[#991B1B]"
                          : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]")
                      }
                    >
                      {item.status || "UNKNOWN"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setSheet({ open: true, item })}
                        className="inline-flex h-8 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex h-8 items-center gap-2 rounded-full border border-[#FEE2E2] bg-white px-3 text-[11px] font-medium text-[#B91C1C] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F3F4F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-[#6B7280]">Page {page} of {totalPages}</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] disabled:opacity-40"
            >Prev</button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      </div>

      {sheet.open && (
        <DesignationSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(1, q); }}
        />
      )}
    </div>
  );
}

function DesignationSheet({ item, onClose, onSaved }: { item: Designation | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState<DesignationPayload>({
    name: item?.name ?? "",
    description: item?.description ?? "",
    status: item?.status ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof DesignationPayload, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit && item) {
        await designationService.update(item.id, form);
      } else {
        await designationService.create(form);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Unable to save designation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit designation" : "New designation"}</div>
            <div className="mt-1 text-[17px] font-semibold text-[#111827]">{item?.name ?? "Create a new role"}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Designation name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Manager, Accounts Lead"
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Description</label>
              <textarea
                rows={4}
                value={form.description ?? ""}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Optional description for this designation"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]"
              >
                <option value="ACTIVE">Active</option>
                <option value="DEACTIVE">Deactive</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-5 py-4">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-[12px] font-medium text-[#374151]">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 rounded-xl bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Save designation" : "Create designation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
