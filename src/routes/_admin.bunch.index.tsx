import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { bunchService, type Bunch } from "@/services/bunch.service";
import { schoolService } from "@/services/school.service";
import { api } from "@/lib/axios";

export const Route = createFileRoute("/_admin/bunch/")({ component: Page });

const LIMIT = 10;

function Page() {
  const [items, setItems] = useState<Bunch[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: Bunch | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await bunchService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleStatusToggle = async (item: Bunch) => {
    await bunchService.changeStatus(item.id, item.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bunch?")) return;
    await bunchService.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Bunch</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Bunches</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Book bundles assigned to schools by class and language.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="h-3.5 w-3.5" />New bunch
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[["Total", total], ["Active", items.filter(i => i.status === "ACTIVE").length], ["Deactive", items.filter(i => i.status === "DEACTIVE").length]].map(([l, v]) => (
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
              placeholder="Search bunches…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-4 py-2 text-left">Bunch</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Language</th>
                <th className="px-4 py-2 text-left">Schools</th>
                <th className="px-4 py-2 text-left">Books</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6B7280]">No bunches found.</td></tr>}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.class?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.language?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.schools?.length ?? 0}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.books?.length ?? 0}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{Number(item.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className={"rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors " + (item.status === "ACTIVE" ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]")}
                    >{item.status}</button>
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
        <BunchSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(); }}
        />
      )}
    </div>
  );
}

// ─── Bunch Sheet ──────────────────────────────────────────────────────────────

function BunchSheet({ item, onClose, onSaved }: { item: Bunch | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
    classId: item?.classId ?? "",
    languageId: item?.languageId ?? "",
    totalAmount: item?.totalAmount ?? 0,
    quantity: item?.quantity ?? 0,
    status: item?.status ?? "ACTIVE",
    schoolIds: item?.schools?.map(s => s.id) ?? [] as string[],
    bookIds: item?.books?.map(b => b.id) ?? [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown data
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
  const [bookToAdd, setBookToAdd] = useState("");

  useEffect(() => {
    schoolService.getActive().then((r) => setSchools(r.data ?? []));
    api.get("/languages/active").then((r) => setLanguages((r.data as any)?.data ?? []));
    api.get("/books", { params: { status: "ACTIVE" } })
      .then((r) => setBooks((r.data as { data?: { data?: { id: string; title: string }[] } })?.data?.data ?? []))
      .catch(() => setBooks([]));
    // Load all classes (no board filter needed here)
    api.get("/school-classes", { params: { limit: 100 } }).then((r) => setClasses((r.data as any)?.data?.data ?? []));
  }, []);

  const toggleId = (key: "schoolIds" | "bookIds", id: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x: string) => x !== id) : [...f[key], id],
    }));
  };

  const addBook = () => {
    if (!bookToAdd) return;
    setForm((current) => (
      current.bookIds.includes(bookToAdd)
        ? current
        : { ...current, bookIds: [...current.bookIds, bookToAdd] }
    ));
    setBookToAdd("");
  };

  const removeBook = (id: string) => {
    setForm((current) => ({ ...current, bookIds: current.bookIds.filter((bookId) => bookId !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await bunchService.update(item.id, {
          name: form.name,
          description: form.description || undefined,
          classId: form.classId,
          languageId: form.languageId,
          totalAmount: Number(form.totalAmount),
          status: form.status,
          schoolIds: form.schoolIds,
          bookIds: form.bookIds,
        });
      } else {
        await bunchService.create({
          name: form.name,
          description: form.description || undefined,
          classId: form.classId,
          languageId: form.languageId,
          totalAmount: Number(form.totalAmount),
          quantity: Number(form.quantity),
          schoolIds: form.schoolIds,
          bookIds: form.bookIds,
          status: form.status,
        });
      }
      onSaved();
    } catch (err: any) {
      const msg = err.response?.data?.data?.errors?.[0] ?? err.response?.data?.message ?? "Something went wrong";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally { setSaving(false); }
  };

  const inp = "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit bunch" : "New bunch"}</div>
            <div className="text-[15px] font-semibold">{form.name || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Bunch name *</label>
                <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Class 10 CBSE Bundle" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Class *</label>
                <select required value={form.classId} onChange={(e) => setForm(f => ({ ...f, classId: e.target.value }))} className={inp}>
                  <option value="">Select class…</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Language *</label>
                <select required value={form.languageId} onChange={(e) => setForm(f => ({ ...f, languageId: e.target.value }))} className={inp}>
                  <option value="">Select language…</option>
                  {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Total amount (₹) *</label>
                <input required type="number" min="0" step="0.01" value={form.totalAmount} onChange={(e) => setForm(f => ({ ...f, totalAmount: e.target.value as any }))} className={inp} />
              </div>
              {!isEdit && (
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Quantity *</label>
                  <input required type="number" min="0" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value as any }))} className={inp} />
                </div>
              )}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Status</label>
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVE">Deactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional…" className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5]" />
              </div>
            </div>

            {/* Schools multi-select */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">
                Schools * <span className="text-[#6B7280]">({form.schoolIds.length} selected)</span>
              </label>
              <div className="max-h-36 overflow-y-auto rounded-md border border-[#E5E7EB] bg-white p-2 space-y-1">
                {schools.length === 0 && <div className="text-[11px] text-[#9CA3AF]">No active schools found</div>}
                {schools.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-[#F9FAFB]">
                    <input
                      type="checkbox"
                      checked={form.schoolIds.includes(s.id)}
                      onChange={() => toggleId("schoolIds", s.id)}
                      className="h-3 w-3 rounded"
                    />
                    <span className="text-[12px]">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Books multi-select */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">
                Books * <span className="text-[#6B7280]">({form.bookIds.length} selected)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={bookToAdd}
                  onChange={(e) => setBookToAdd(e.target.value)}
                  className={inp}
                  disabled={books.length === 0}
                >
                  <option value="">{books.length === 0 ? "No books found" : "Select a book…"}</option>
                  {books
                    .filter((book) => !form.bookIds.includes(book.id))
                    .map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
                </select>
                <button
                  type="button"
                  onClick={addBook}
                  disabled={!bookToAdd}
                  className="h-8 shrink-0 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add book
                </button>
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-[#E5E7EB] bg-white p-2 space-y-1">
                {form.bookIds.length === 0 && <div className="text-[11px] text-[#9CA3AF]">Select a book from the dropdown to add it.</div>}
                {form.bookIds.map((bookId) => {
                  const book = books.find((entry) => entry.id === bookId) ?? item?.books?.find((entry) => entry.id === bookId);
                  return (
                    <div key={bookId} className="flex items-center justify-between gap-2 rounded px-1 py-1 hover:bg-[#F9FAFB]">
                      <span className="truncate text-[12px]">{book?.title ?? "Selected book"}</span>
                      <button
                        type="button"
                        onClick={() => removeBook(bookId)}
                        className="rounded p-0.5 text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                        aria-label={`Remove ${book?.title ?? "book"}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
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
