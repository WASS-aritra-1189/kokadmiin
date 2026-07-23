import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, Search, Upload, X } from "lucide-react";

const LIMIT = 10;

export interface CatalogColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
}

export interface CatalogSheetField {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "select" | "email" | "tel";
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
}

interface Props<T extends { id: string; status: string; createdAt: string }> {
  title: string;
  description: string;
  newLabel: string;
  columns: CatalogColumn<T>[];
  sheetFields: CatalogSheetField[];
  fetchFn: (params: { page: number; limit: number; search?: string }) => Promise<any>;
  createFn: (data: any) => Promise<any>;
  updateFn: (id: string, data: any) => Promise<any>;
  changeStatusFn: (id: string, status: string) => Promise<any>;
  deleteFn: (id: string) => Promise<any>;
  defaultForm: Record<string, any>;
  extraSheetContent?: (form: Record<string, any>, setForm: (f: Record<string, any>) => void) => ReactNode;
  uploadProfileImageFn?: (id: string, file: File) => Promise<any>;
  profileImageField?: string;
}

export function CatalogApiPage<T extends { id: string; status: string; createdAt: string }>({
  title, description, newLabel, columns, sheetFields,
  fetchFn, createFn, updateFn, changeStatusFn, deleteFn,
  defaultForm, extraSheetContent, uploadProfileImageFn, profileImageField,
}: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: T | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await fetchFn({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleStatusToggle = async (item: T) => {
    const next = item.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE";
    await changeStatusFn(item.id, next);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${title.replace(/s$/, "").toLowerCase()}?`)) return;
    await deleteFn(id);
    load();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadProfileImage = async (item: T) => {
    if (!uploadProfileImageFn || !profileImageField) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingImage(true);
      try {
        await uploadProfileImageFn((item as any).id, file);
        load();
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{description}</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="h-3.5 w-3.5" />{newLabel}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={total} />
        <StatCard label="Active" value={items.filter((i) => i.status === "ACTIVE").length} />
        <StatCard label="Deactive" value={items.filter((i) => i.status === "DEACTIVE").length} />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                {columns.map((c) => (
                  <th key={c.key} className={"px-4 py-2 " + (c.align === "right" ? "text-right" : "text-left")}>{c.label}</th>
                ))}
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={columns.length + 3} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={columns.length + 3} className="px-4 py-8 text-center text-[#6B7280]">No records found.</td></tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  {columns.map((c) => (
                    <td key={c.key} className={"px-4 py-2.5 " + (c.align === "right" ? "text-right tabular-nums" : "")}>
                      {c.render ? c.render(item) : String((item as any)[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className={"rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors " +
                        (item.status === "ACTIVE"
                          ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                          : item.status === "DELETED"
                          ? "bg-[#FEE2E2] text-[#991B1B] cursor-default"
                          : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]")}
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSheet({ open: true, item })}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md border border-[#FEE2E2] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
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

        {/* Pagination */}
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
        <CatalogSheet
          title={title}
          item={sheet.item}
          fields={sheetFields}
          defaultForm={defaultForm}
          createFn={createFn}
          updateFn={updateFn}
          extraContent={extraSheetContent}
          uploadProfileImageFn={uploadProfileImageFn}
          profileImageField={profileImageField}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(); }}
        />
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
    </div>
  );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

function CatalogSheet({ title, item, fields, defaultForm, createFn, updateFn, extraContent, uploadProfileImageFn, profileImageField, onClose, onSaved }: {
  title: string;
  item: any | null;
  fields: CatalogSheetField[];
  defaultForm: Record<string, any>;
  createFn: (data: any) => Promise<any>;
  updateFn: (id: string, data: any) => Promise<any>;
  extraContent?: (form: Record<string, any>, setForm: (f: Record<string, any>) => void) => ReactNode;
  uploadProfileImageFn?: (id: string, file: File) => Promise<any>;
  profileImageField?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!item;
  const [profileImage, setProfileImage] = useState<string | null>(item?.[profileImageField || ''] ?? null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const [form, setForm] = useState<Record<string, any>>(() => {
    if (!item) return { ...defaultForm };
    const f: Record<string, any> = { ...defaultForm };
    fields.forEach((field) => { f[field.key] = (item as any)[field.key] ?? defaultForm[field.key] ?? ""; });
    return f;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await updateFn(item.id, form);
        // Upload profile image if selected
        if (profileImageFile && item?.id && uploadProfileImageFn) {
          await uploadProfileImageFn(item.id, profileImageFile);
        }
      } else {
        await createFn(form);
      }
      onSaved();
    } catch (err: any) {
      const msg = err.response?.data?.data?.errors?.[0] ?? err.response?.data?.message ?? "Something went wrong";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const inp = "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit" : "New"} {title.replace(/s$/, "")}</div>
            <div className="text-[15px] font-semibold">{form.name || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>
            )}

            {(uploadProfileImageFn && profileImageField) && (
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] bg-[#F9FAFB]">
                  {profileImage
                    ? <img src={profileImage} alt="profile" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center text-[10px] text-[#9CA3AF]">No image</div>
                  }
                </div>
                <div>
                  <button type="button" onClick={() => profileFileRef.current?.click()} className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                    <Upload className="h-3.5 w-3.5" />{profileImage ? "Change" : "Upload"}
                  </button>
                  <p className="mt-1.5 text-[10.5px] text-[#9CA3AF]">JPEG or PNG, max 5 MB.</p>
                  <input ref={profileFileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleProfileImageChange} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.key} className={f.full || f.type === "textarea" ? "col-span-2" : ""}>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">
                    {f.label}{f.required && " *"}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={form[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5]"
                    />
                  ) : f.type === "select" ? (
                    <select value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={inp}>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type ?? "text"}
                      required={f.required}
                      value={form[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={inp}
                    />
                  )}
                </div>
              ))}
            </div>

            {extraContent?.(form, setForm)}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151]">
              Cancel
            </button>
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
