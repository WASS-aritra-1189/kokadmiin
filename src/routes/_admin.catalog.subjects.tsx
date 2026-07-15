import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { subjectService, type Subject, type SubjectPayload } from "@/services/subject.service";
import { catalogApi } from "@/services/books.service";

export const Route = createFileRoute("/_admin/catalog/subjects")({ component: Page });

const LIMIT = 10;

function Page() {
  const [items, setItems] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: Subject | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await subjectService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleStatusToggle = async (item: Subject) => {
    const next = item.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE";
    await subjectService.changeStatus(item.id, next);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;
    await subjectService.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Catalog</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Subjects</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Curriculum-aligned subjects used to classify textbooks, guides and question banks.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="h-3.5 w-3.5" />New subject
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={total} />
        <StatCard label="Active" value={items.filter((i) => i.status === "ACTIVE").length} />
        <StatCard label="Deactive" value={items.filter((i) => i.status === "DEACTIVE").length} />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search subjects…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Board</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">No subjects found.</td></tr>}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.board?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.schoolClass?.name ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className={"rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors " +
                        (item.status === "ACTIVE" ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]")}
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
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={"rounded-md px-2 py-1 " + (p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {sheet.open && (
        <SubjectSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(); }}
        />
      )}
    </div>
  );
}

function SubjectSheet({ item, onClose, onSaved }: { item: Subject | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState<SubjectPayload>({
    name: item?.name ?? "",
    boardId: item?.boardId ?? "",
    classId: item?.classId ?? "",
    description: item?.description ?? "",
    status: item?.status ?? "ACTIVE",
  });
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { catalogApi.boards().then(setBoards); }, []);

  useEffect(() => {
    if (!form.boardId) { setClasses([]); return; }
    catalogApi.classesByBoard(form.boardId).then(setClasses);
    if (!isEdit) setForm((f) => ({ ...f, classId: "" }));
  }, [form.boardId]);

  const set = (k: keyof SubjectPayload, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inp = "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEdit) { await subjectService.update(item.id, form); }
      else { await subjectService.create(form); }
      onSaved();
    } catch (err: any) {
      const msg = err.response?.data?.data?.errors?.[0] ?? err.response?.data?.message ?? "Something went wrong";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit subject" : "New subject"}</div>
            <div className="text-[15px] font-semibold">{form.name || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Subject name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Mathematics, Science" className={inp} />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Board *</label>
              <select required value={form.boardId} onChange={(e) => set("boardId", e.target.value)} className={inp}>
                <option value="">Select board…</option>
                {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Class *</label>
              <select required value={form.classId} onChange={(e) => set("classId", e.target.value)} disabled={!form.boardId} className={inp + (!form.boardId ? " opacity-50 cursor-not-allowed" : "")}>
                <option value="">{form.boardId ? "Select class…" : "Select board first"}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Description</label>
              <textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Optional description…" className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5]" />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Status</label>
              <select value={form.status ?? "ACTIVE"} onChange={(e) => set("status", e.target.value)} className={inp}>
                <option value="ACTIVE">Active</option>
                <option value="DEACTIVE">Deactive</option>
              </select>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{label}</div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}
