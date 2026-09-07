import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil } from "lucide-react";
import { commTemplateService, type CommChannel, type CommTemplate } from "@/services/communication.service";

export const Route = createFileRoute("/_admin/comms/templates")({ component: Page });

const CHANNELS: { value: CommChannel; label: string; color: string }[] = [
  { value: "EMAIL", label: "Email", color: "bg-blue-100 text-blue-700" },
  { value: "SMS", label: "SMS", color: "bg-green-100 text-green-700" },
  { value: "PUSH", label: "Push", color: "bg-purple-100 text-purple-700" },
  { value: "WHATSAPP", label: "WhatsApp", color: "bg-emerald-100 text-emerald-700" },
];

function Page() {
  const [items, setItems] = useState<CommTemplate[]>([]);
  const [channel, setChannel] = useState<CommChannel | "">("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: CommTemplate | null }>({ open: false, item: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await commTemplateService.getAll(channel as CommChannel || undefined);
      setItems(Array.isArray(data) ? data : data?.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [channel]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await commTemplateService.delete(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Communication Templates</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Manage reusable templates for Email, SMS, Push and WhatsApp.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="h-3.5 w-3.5" /> New Template
        </button>
      </div>

      {/* Channel filter tabs */}
      <div className="mt-5 flex gap-2 flex-wrap">
        <button
          onClick={() => setChannel("")}
          className={`rounded-full px-3 py-1 text-[12px] font-medium border transition-colors ${channel === "" ? "bg-[#111827] text-white border-[#111827]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
        >All</button>
        {CHANNELS.map(c => (
          <button
            key={c.value}
            onClick={() => setChannel(c.value)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium border transition-colors ${channel === c.value ? "bg-[#111827] text-white border-[#111827]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
          >{c.label}</button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
            <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Channel</th>
              <th className="px-4 py-2 text-left">Subject / Title</th>
              <th className="px-4 py-2 text-left">Variables</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">No templates found.</td></tr>}
            {!loading && items.map(item => {
              const ch = CHANNELS.find(c => c.value === item.channel);
              return (
                <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ch?.color ?? "bg-gray-100 text-gray-600"}`}>{item.channel}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B7280] max-w-[200px] truncate">{item.subject ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.variables?.join(", ") || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === "ACTIVE" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]"}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSheet({ open: true, item })} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => handleDelete(item.id)} className="rounded-md border border-[#FEE2E2] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sheet.open && (
        <TemplateSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(); }}
        />
      )}
    </div>
  );
}

function TemplateSheet({ item, onClose, onSaved }: { item: CommTemplate | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "",
    channel: item?.channel ?? "EMAIL" as CommChannel,
    subject: item?.subject ?? "",
    body: item?.body ?? "",
    variables: item?.variables?.join(", ") ?? "",
    status: item?.status ?? "ACTIVE",
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
        ...form,
        variables: form.variables ? form.variables.split(",").map(v => v.trim()).filter(Boolean) : [],
      };
      if (isEdit) await commTemplateService.update(item.id, payload);
      else await commTemplateService.create(payload);
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit" : "New"} Template</div>
            <div className="text-[15px] font-semibold">{form.name || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Email" className={inp} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Channel *</label>
              <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value as CommChannel }))} className={inp} disabled={isEdit}>
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Subject / Title</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Welcome to KOK Books!" className={inp} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Body *</label>
              <textarea
                required rows={8}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder={"Use {{variable}} for dynamic values.\ne.g. Hello {{name}}, your order {{orderId}} is confirmed."}
                className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Variables <span className="text-[#9CA3AF]">(comma separated)</span></label>
              <input value={form.variables} onChange={e => setForm(f => ({ ...f, variables: e.target.value }))} placeholder="name, orderId, amount" className={inp} />
            </div>
            {isEdit && (
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVE">Deactive</option>
                </select>
              </div>
            )}
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
