import { useMemo, useState, type ReactNode } from "react";
import { Download, Plus, Search, Upload, X } from "lucide-react";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
};

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "toggle" | "color";
  options?: string[];
  placeholder?: string;
  help?: string;
  full?: boolean;
};

export function CatalogPage<T extends { id: string }>({
  group,
  title,
  description,
  rows,
  columns,
  fields,
  searchKeys,
  newLabel = "New",
  stats,
  extraFilters,
}: {
  group: string;
  title: string;
  description: string;
  rows: T[];
  columns: Column<T>[];
  fields: FormField[];
  searchKeys: (keyof T)[];
  newLabel?: string;
  stats?: { label: string; value: string | number; hint?: string }[];
  extraFilters?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(s))
    );
  }, [rows, q, searchKeys]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">{group}</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"><Upload className="h-3.5 w-3.5" />Import CSV</button>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"><Download className="h-3.5 w-3.5" />Export</button>
          <button onClick={() => setEditing({} as Partial<T>)} className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"><Plus className="h-3.5 w-3.5" />{newLabel}</button>
        </div>
      </div>

      {stats && (
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{s.label}</div>
              <div className="mt-1 text-[22px] font-semibold tabular-nums">{s.value}</div>
              {s.hint && <div className="mt-0.5 text-[11px] text-[#6B7280]">{s.hint}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]" />
          </div>
          {extraFilters}
          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-md bg-[#EEF2FF] px-2 py-1 text-[11px] font-medium text-[#4F46E5]">
              {selected.size} selected
              <button className="rounded-md bg-white px-2 py-0.5 text-[10px] text-[#374151]">Merge</button>
              <button className="rounded-md bg-white px-2 py-0.5 text-[10px] text-[#EF4444]">Delete</button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? new Set() : new Set(filtered.map((r) => r.id)))} />
                </th>
                {columns.map((c) => (
                  <th key={c.key} className={"px-3 py-2 " + (c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left")}>{c.label}</th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => setSelected((s) => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })}
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={"px-3 py-2 " + (c.align === "right" ? "text-right tabular-nums" : c.align === "center" ? "text-center" : "") + " " + (c.className ?? "")}>
                      {c.render ? c.render(r) : String((r as any)[c.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setEditing(r)} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={columns.length + 2} className="px-3 py-10 text-center text-[12px] text-[#6B7280]">No records match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div>Showing <span className="font-medium text-[#111827]">{filtered.length}</span> of {rows.length}</div>
          <div className="flex items-center gap-1">
            <button className="rounded-md border border-[#E5E7EB] px-2 py-1">Prev</button>
            <button className="rounded-md bg-[#111827] px-2 py-1 text-white">1</button>
            <button className="rounded-md border border-[#E5E7EB] px-2 py-1">Next</button>
          </div>
        </div>
      </div>

      {editing && (
        <EditSheet
          fields={fields}
          record={editing}
          title={(editing as any).id ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EditSheet({ fields, record, title, onClose }: { fields: FormField[]; record: any; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{record.id ? "Edit" : "Create"}</div>
            <div className="text-[15px] font-semibold">{title}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.full || f.type === "textarea" ? "col-span-2" : ""}>
                <label className="text-[11px] font-medium text-[#374151]">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea rows={3} defaultValue={record[f.name] ?? ""} placeholder={f.placeholder} className="mt-1 w-full rounded-md border border-[#E5E7EB] bg-white p-2 text-[12px] outline-none focus:border-[#4F46E5]" />
                ) : f.type === "select" ? (
                  <select defaultValue={record[f.name] ?? ""} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]">
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "toggle" ? (
                  <div className="mt-1 flex h-8 items-center gap-2">
                    <input type="checkbox" defaultChecked={!!record[f.name]} />
                    <span className="text-[12px] text-[#6B7280]">Enabled</span>
                  </div>
                ) : f.type === "color" ? (
                  <input type="color" defaultValue={record[f.name] ?? "#4F46E5"} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white p-0.5" />
                ) : (
                  <input
                    type={f.type ?? "text"}
                    defaultValue={record[f.name] ?? ""}
                    placeholder={f.placeholder}
                    className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]"
                  />
                )}
                {f.help && <div className="mt-1 text-[10px] text-[#6B7280]">{f.help}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3">
          {record.id ? (
            <button className="text-[12px] font-medium text-[#EF4444] hover:underline">Delete</button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">Cancel</button>
            <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
