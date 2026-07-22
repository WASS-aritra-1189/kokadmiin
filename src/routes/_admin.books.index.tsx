import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Plus, Search, Upload, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchBooks, createBook, updateBook, deleteBook, deleteMultipleBooks } from "@/store/slices/booksSlice";
import { catalogApi, booksService, type BookItem, type CreateBookPayload, type DropdownItem, type BookLanguage, type BookClass, type BookSubject } from "@/services/books.service";

export const Route = createFileRoute("/_admin/books/")({
  component: BooksPage,
});

const LIMIT = 10;

const EMPTY: CreateBookPayload = {
  title: "", authorId: "", productCategoryId: "", boardId: "", classId: "",
  subjectId: "", genreId: "", languageId: "", description: "", publisher: "",
  publishedYear: "", pages: undefined, price: undefined, discountPrice: undefined,
  quantity: 0, weight: 0.5, status: "ACTIVE",
};

function BooksPage() {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.books);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sheet, setSheet] = useState<{ open: boolean; book: BookItem | null }>({ open: false, book: null });

  const load = (p = page, s = statusFilter, search = q) => {
    dispatch(fetchBooks({
      page: p, limit: LIMIT,
      ...(search ? { search } : {}),
      ...(s !== "All" ? { status: s } : {}),
    }));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = items.length > 0 && items.every((b) => selected.has(b.id));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Books</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Book catalog</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} titles in the catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
            <Download className="h-3.5 w-3.5" />Export
          </button>
          <button
            onClick={() => setSheet({ open: true, book: null })}
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
          >
            <Plus className="h-3.5 w-3.5" />New book
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, statusFilter, q); } }}
              placeholder="Search title, author, ISBN…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            Status:
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827] outline-none"
            >
              {["All", "ACTIVE", "DEACTIVE", "DELETED"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-md bg-[#EEF2FF] px-2 py-1 text-[11px] font-medium text-[#4F46E5]">
              {selected.size} selected
              <button 
                onClick={async () => {
                  if (!confirm(`Delete ${selected.size} book(s)?`)) return;
                  await dispatch(deleteMultipleBooks(Array.from(selected)));
                  setSelected(new Set());
                  load();
                }} 
                className="rounded-md bg-white px-2 py-0.5 text-[10px] text-[#EF4444]"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? new Set() : new Set(items.map((b) => b.id)))} />
                </th>
                <th className="px-3 py-2 text-left">Book</th>
                <th className="px-3 py-2 text-left">ISBN</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Genre</th>
                <th className="px-3 py-2 text-left">Language</th>
                <th className="px-3 py-2 text-right">MRP</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Stock</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={11} className="px-3 py-8 text-center text-[12px] text-[#6B7280]">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={11} className="px-3 py-8 text-center text-[12px] text-[#6B7280]">No books found.</td></tr>
              )}
              {!loading && items.map((b) => (
                <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2"><input type="checkbox" checked={selected.has(b.id)} onChange={() => toggle(b.id)} /></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      {b.coverImage
                        ? <img src={b.coverImage} alt={b.title} className="h-9 w-7 flex-shrink-0 rounded-sm object-cover shadow-sm" />
                        : <div className="h-9 w-7 flex-shrink-0 rounded-sm bg-[#E5E7EB] shadow-sm" />
                      }
                      <div className="min-w-0">
                        <div className="truncate font-medium">{b.title}</div>
                        <div className="text-[10px] text-[#6B7280]">{b.author?.name ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">{b.isbn}</td>
                  <td className="px-3 py-2 text-[#4B5563]">{b.productCategory?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-[#4B5563]">{b.genre?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-[#4B5563]">{b.language?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-[#9CA3AF] line-through">₹{b.price}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">₹{b.discountPrice ?? b.price}</td>
                  <td className={"px-3 py-2 text-right tabular-nums font-medium " + (b.quantity === 0 ? "text-[#EF4444]" : b.quantity <= 10 ? "text-[#F59E0B]" : "text-[#111827]")}>
                    {b.quantity}
                  </td>
                  <td className="px-3 py-2"><StatusChip status={b.status} /></td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={async () => {
                          const newStatus = b.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE";
                          if (!confirm(`Change status to ${newStatus}?`)) return;
                          try {
                            await booksService.updateStatus(b.id, newStatus);
                            load();
                          } catch (err) {
                            alert("Failed to update status");
                          }
                        }}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#4F46E5] hover:bg-[#EEF2FF]"
                      >
                        {b.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setSheet({ open: true, book: b })}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete "${b.title}"?`)) return;
                          await dispatch(deleteBook(b.id));
                          load();
                        }}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
                      >
                        Delete
                      </button>
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
        <BookSheet
          book={sheet.book}
          onClose={() => setSheet({ open: false, book: null })}
          onSaved={() => { setSheet({ open: false, book: null }); load(); }}
        />
      )}
    </div>
  );
}

// ─── BookSheet ────────────────────────────────────────────────────────────────

interface BookSheetProps {
  book: BookItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function BookSheet({ book, onClose, onSaved }: BookSheetProps) {
  const dispatch = useAppDispatch();
  const { saving, error } = useAppSelector((s) => s.books);
  const isEdit = !!book;

  const [form, setForm] = useState<CreateBookPayload>(() =>
    book
      ? {
          title: book.title,
          authorId: book.authorId ?? "",
          productCategoryId: book.productCategoryId ?? "",
          boardId: book.boardId ?? "",
          classId: book.classId ?? "",
          subjectId: book.subjectId ?? "",
          genreId: book.genreId ?? "",
          languageId: book.languageId ?? "",
          description: book.description ?? "",
          publisher: book.publisher ?? "",
          publishedYear: book.publishedYear ?? "",
          pages: book.pages ?? undefined,
          price: book.price ? parseFloat(book.price) : undefined,
          discountPrice: book.discountPrice ? parseFloat(book.discountPrice) : undefined,
          quantity: book.quantity,
          weight: book.weight ?? 0.5,
          status: book.status,
        }
      : { ...EMPTY }
  );

  // Dropdowns
  const [authors, setAuthors] = useState<DropdownItem[]>([]);
  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [genres, setGenres] = useState<DropdownItem[]>([]);
  const [languages, setLanguages] = useState<BookLanguage[]>([]);
  const [boards, setBoards] = useState<DropdownItem[]>([]);
  const [classes, setClasses] = useState<BookClass[]>([]);
  const [subjects, setSubjects] = useState<BookSubject[]>([]);

  // Cover upload
  const [coverPreview, setCoverPreview] = useState<string | null>(book?.coverImage ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[BookSheet] mounting — loading dropdowns");
    catalogApi.authors().then((a) => { console.log("[BookSheet] authors:", a); setAuthors(a); });
    catalogApi.productCategories().then((c) => { console.log("[BookSheet] categories:", c); setCategories(c); });
    catalogApi.genres().then((g) => { console.log("[BookSheet] genres:", g); setGenres(g); });
    catalogApi.languages().then((l) => { console.log("[BookSheet] languages:", l); setLanguages(l); });
    catalogApi.boards().then((b) => { console.log("[BookSheet] boards:", b); setBoards(b); });
  }, []);

  // When board changes, load classes
  useEffect(() => {
    if (!form.boardId) { setClasses([]); setSubjects([]); return; }
    catalogApi.classesByBoard(form.boardId).then(setClasses);
    setForm((f) => ({ ...f, classId: "", subjectId: "" }));
    setSubjects([]);
  }, [form.boardId]);

  // When class changes, load subjects
  useEffect(() => {
    if (!form.boardId || !form.classId) { setSubjects([]); return; }
    catalogApi.subjectsByBoardClass(form.boardId, form.classId).then(setSubjects);
    setForm((f) => ({ ...f, subjectId: "" }));
  }, [form.classId]);

  const set = (k: keyof CreateBookPayload, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const payload: CreateBookPayload = {
      ...form,
      authorId: form.authorId || undefined,
      productCategoryId: form.productCategoryId || undefined,
      boardId: form.boardId || undefined,
      classId: form.classId || undefined,
      subjectId: form.subjectId || undefined,
      genreId: form.genreId || undefined,
      languageId: form.languageId || undefined,
    };

    let result: any;
    if (isEdit) {
      result = await dispatch(updateBook({ id: book.id, data: payload }));
    } else {
      result = await dispatch(createBook(payload));
    }

    if (result.meta.requestStatus === "rejected") {
      setSubmitError(result.payload as string);
      return;
    }

    // Upload cover if selected (only possible after book exists)
    const bookId = isEdit ? book.id : result.payload?.data?.id;
    if (coverFile && bookId) {
      try { await booksService.uploadCover(bookId, coverFile); } catch { /* non-fatal */ }
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit book" : "New book"}</div>
            <div className="text-[15px] font-semibold">{form.title || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {(submitError || error) && (
              <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">
                {submitError || error}
              </div>
            )}

            {/* Basic info */}
            <Section title="Basic Information">
              <Field label="Title *" full>
                <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={input()} placeholder="Book title" />
              </Field>
              <Field label="Author">
                <Select value={form.authorId ?? ""} onChange={(v) => set("authorId", v)} options={authors} placeholder="Select author" />
              </Field>
              <Field label="Publisher">
                <input value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={input()} placeholder="e.g. Penguin" />
              </Field>
              <Field label="Published Year">
                <input value={form.publishedYear ?? ""} onChange={(e) => set("publishedYear", e.target.value)} className={input()} placeholder="e.g. 2024" maxLength={4} />
              </Field>
              <Field label="Pages">
                <input type="number" min={1} value={form.pages ?? ""} onChange={(e) => set("pages", e.target.value ? parseInt(e.target.value) : undefined)} className={input()} placeholder="320" />
              </Field>
              <Field label="Language">
                <Select value={form.languageId ?? ""} onChange={(v) => set("languageId", v)} options={languages} placeholder="Select language" />
              </Field>
              <Field label="Description" full>
                <textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className={input() + " h-auto py-2"} placeholder="Book description…" />
              </Field>
            </Section>

            {/* Classification */}
            <Section title="Classification">
              <Field label="Product Category">
                <Select value={form.productCategoryId ?? ""} onChange={(v) => set("productCategoryId", v)} options={categories} placeholder="Select category" />
              </Field>
              <Field label="Genre">
                <Select value={form.genreId ?? ""} onChange={(v) => set("genreId", v)} options={genres} placeholder="Select genre" />
              </Field>
              <Field label="Board">
                <Select value={form.boardId ?? ""} onChange={(v) => set("boardId", v)} options={boards} placeholder="Select board" />
              </Field>
              <Field label="Class">
                <Select value={form.classId ?? ""} onChange={(v) => set("classId", v)} options={classes} placeholder={form.boardId ? "Select class" : "Select board first"} disabled={!form.boardId} />
              </Field>
              <Field label="Subject">
                <Select value={form.subjectId ?? ""} onChange={(v) => set("subjectId", v)} options={subjects} placeholder={form.classId ? "Select subject" : "Select class first"} disabled={!form.classId} />
              </Field>
            </Section>

            {/* Pricing & Inventory */}
            <Section title="Pricing & Inventory">
              <Field label="MRP (₹) *">
                <input required type="number" min={0} step="0.01" value={form.price ?? ""} onChange={(e) => set("price", e.target.value ? parseFloat(e.target.value) : undefined)} className={input()} placeholder="499.00" />
              </Field>
              <Field label="Selling Price (₹)">
                <input type="number" min={0} step="0.01" value={form.discountPrice ?? ""} onChange={(e) => set("discountPrice", e.target.value ? parseFloat(e.target.value) : undefined)} className={input()} placeholder="399.00" />
              </Field>
              <Field label="Stock Quantity">
                <input type="number" min={0} value={form.quantity ?? 0} onChange={(e) => set("quantity", parseInt(e.target.value) || 0)} className={input()} />
              </Field>
              <Field label="Weight (kg)">
                <input type="number" min={0.1} step="0.1" value={form.weight ?? 0.5} onChange={(e) => set("weight", e.target.value ? parseFloat(e.target.value) : 0.5)} className={input()} placeholder="0.5" />
              </Field>
              <Field label="Status">
                <select value={form.status ?? "ACTIVE"} onChange={(e) => set("status", e.target.value)} className={input()}>
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVE">Deactive</option>
                </select>
              </Field>
            </Section>

            {/* Cover Image */}
            <Section title="Cover Image">
              <div className="col-span-2 flex items-start gap-4">
                <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F9FAFB]">
                  {coverPreview
                    ? <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center text-[10px] text-[#9CA3AF]">No image</div>
                  }
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                    <Upload className="h-3.5 w-3.5" />{coverPreview ? "Change cover" : "Upload cover"}
                  </button>
                  <p className="mt-1.5 text-[10.5px] text-[#9CA3AF]">JPEG or PNG, max 5 MB.</p>
                  {!isEdit && coverFile && (
                    <p className="mt-1 text-[10.5px] text-[#F59E0B]">Cover will be uploaded after the book is created.</p>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleCoverChange} />
                </div>
              </div>
            </Section>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151]">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="h-8 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">{title}</div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-medium text-[#374151]">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={input() + (disabled ? " opacity-50 cursor-not-allowed" : "")}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}

function input() {
  return "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#EEF2FF]";
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-[#DCFCE7] text-[#166534]",
    DEACTIVE: "bg-[#F3F4F6] text-[#4B5563]",
    DELETED: "bg-[#FEE2E2] text-[#991B1B]",
    PENDING: "bg-[#FEF9C3] text-[#854D0E]",
    OUT_OF_STOCK: "bg-[#FEE2E2] text-[#991B1B]",
  };
  return (
    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (map[status] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
      {status}
    </span>
  );
}
