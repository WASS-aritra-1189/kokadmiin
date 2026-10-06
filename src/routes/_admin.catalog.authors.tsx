import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { authorService } from "@/services/author.service";

export const Route = createFileRoute("/_admin/catalog/authors")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

const validateEmail = (value: string): string | null => {
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Invalid email address";
};

const validatePhone = (value: string): string | null => {
  if (!value) return null;
  const cleaned = value.replace(/[\s\-()]/g, '');
  return /^[+]?[\d]{10,15}$/.test(cleaned) ? null : "Invalid phone number (10-15 digits)";
};

const validateNationality = (value: string): string | null => {
  if (!value) return null;
  return value.length >= 2 && value.length <= 50 ? null : "Nationality must be 2-50 characters";
};

function FeaturedCell({ row, onSaved }: { row: any; onSaved: () => void }) {
  const [priority, setPriority] = useState<string>(row.featuredPriority?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setPriority(row.featuredPriority?.toString() ?? ""); }, [row.featuredPriority]);

  const toggle = async () => {
    setSaving(true); setError(null);
    try { await authorService.toggleFeatured(row.id, !row.isFeatured); onSaved(); }
    catch { setError("Failed"); } finally { setSaving(false); }
  };

  const save = async () => {
    setSaving(true); setError(null);
    try { await authorService.toggleFeatured(row.id, true, priority ? parseInt(priority) : null); onSaved(); }
    catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      setError(msg.toLowerCase().includes("unique") || err?.response?.status === 409 ? `#${priority} taken` : "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <button onClick={toggle} disabled={saving}
          className={"rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-50 " +
            (row.isFeatured ? "bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#BFDBFE]" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]")}>
          {row.isFeatured ? "⭐ Yes" : "☆ No"}
        </button>
        {row.isFeatured && (
          <div className="flex items-center gap-1">
            <input type="number" min={1} value={priority}
              onChange={(e) => { setPriority(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              placeholder="#"
              className={"h-6 w-10 rounded border bg-white px-1.5 text-[11px] text-center outline-none focus:border-[#4F46E5] " +
                (error ? "border-[#EF4444]" : "border-[#E5E7EB]")} />
            <button onClick={save} disabled={saving}
              className="h-6 rounded bg-[#DBEAFE] px-1.5 text-[10px] font-medium text-[#1D4ED8] hover:bg-[#BFDBFE] disabled:opacity-50">
              ✓
            </button>
          </div>
        )}
      </div>
      {error && <span className="text-[10px] text-[#EF4444]">{error}</span>}
    </div>
  );
}

function Page() {
  const [reload, setReload] = useState(0);
  const doReload = () => setReload((n) => n + 1);

  return (
    <CatalogApiPage
      key={reload}
      title="Authors"
      description="Author profiles powering author pages, filter facets and book attribution."
      newLabel="New author"
      fetchFn={authorService.getAll}
      createFn={authorService.create}
      updateFn={authorService.update}
      changeStatusFn={authorService.changeStatus}
      deleteFn={authorService.delete}
      uploadProfileImageFn={authorService.uploadProfileImage}
      profileImageField="profileImage"
      defaultForm={{ name: "", bio: "", email: "", phone: "", nationality: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Author",
          render: (r: any) => (
            <div className="flex items-center gap-2">
              {r.profileImage ? (
                <img src={r.profileImage} alt={r.name} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#C7D2FE] text-[11px] font-semibold text-[#4F46E5]">
                  {r.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-[10px] text-[#6B7280]">{r.nationality ?? "—"}</div>
              </div>
            </div>
          ),
        },
        { key: "email", label: "Email", render: (r: any) => <span className="text-[#6B7280]">{r.email ?? "—"}</span> },
        { key: "phone", label: "Phone", render: (r: any) => <span className="text-[#6B7280]">{r.phone ?? "—"}</span> },
        { key: "bookCount", label: "Books", align: "right", render: (r: any) => <span className="tabular-nums">{r.bookCount ?? 0}</span> },
        { key: "isFeatured", label: "Featured", render: (r: any) => <FeaturedCell row={r} onSaved={doReload} /> },
      ]}
      sheetFields={[
        { key: "name", label: "Full name", required: true, placeholder: "e.g. Ruskin Bond", full: true },
        { key: "email", label: "Email", type: "email", placeholder: "author@example.com", validate: validateEmail },
        { key: "phone", label: "Phone", type: "tel", placeholder: "+91 9876543210", validate: validatePhone },
        { key: "nationality", label: "Nationality", placeholder: "e.g. Indian", validate: validateNationality },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        { key: "bio", label: "Biography", type: "textarea", placeholder: "Short author biography…", full: true },
      ]}
    />
  );
}
