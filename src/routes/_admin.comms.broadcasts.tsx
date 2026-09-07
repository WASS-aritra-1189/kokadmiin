import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send, X, Search, UserCheck } from "lucide-react";
import {
  broadcastService, commTemplateService,
  type CommChannel, type RecipientType, type Broadcast, type CommTemplate,
} from "@/services/communication.service";
import { customersService, type Customer } from "@/services/customers.service";

export const Route = createFileRoute("/_admin/comms/broadcasts")({ component: Page });

const CHANNELS: { value: CommChannel; label: string; color: string }[] = [
  { value: "EMAIL", label: "Email", color: "bg-blue-100 text-blue-700" },
  { value: "SMS", label: "SMS", color: "bg-green-100 text-green-700" },
  { value: "PUSH", label: "Push", color: "bg-purple-100 text-purple-700" },
  { value: "WHATSAPP", label: "WhatsApp", color: "bg-emerald-100 text-emerald-700" },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SENT: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  PARTIAL: "bg-orange-100 text-orange-700",
};

function Page() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterChannel, setFilterChannel] = useState<CommChannel | "">("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await broadcastService.getAll(filterChannel as CommChannel || undefined);
      setBroadcasts(Array.isArray(data) ? data : data?.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterChannel]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Broadcasts</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Send bulk messages via Email, SMS, Push or WhatsApp.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Send className="h-3.5 w-3.5" /> Send Broadcast
        </button>
      </div>

      {/* Channel filter */}
      <div className="mt-5 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterChannel("")}
          className={`rounded-full px-3 py-1 text-[12px] font-medium border transition-colors ${filterChannel === "" ? "bg-[#111827] text-white border-[#111827]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
        >All</button>
        {CHANNELS.map(c => (
          <button
            key={c.value}
            onClick={() => setFilterChannel(c.value)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium border transition-colors ${filterChannel === c.value ? "bg-[#111827] text-white border-[#111827]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
          >{c.label}</button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
            <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Channel</th>
              <th className="px-4 py-2 text-left">Recipients</th>
              <th className="px-4 py-2 text-left">Sent / Failed</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
            {!loading && broadcasts.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">No broadcasts yet.</td></tr>}
            {!loading && broadcasts.map(b => {
              const ch = CHANNELS.find(c => c.value === b.channel);
              return (
                <tr key={b.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{b.subject}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ch?.color ?? "bg-gray-100 text-gray-600"}`}>{b.channel}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{b.recipientType === "ALL" ? "All users" : `${b.totalRecipients} selected`}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">
                    <span className="text-green-600">{b.successCount}</span>
                    {" / "}
                    <span className="text-red-500">{b.failureCount}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[b.status] ?? "bg-gray-100 text-gray-600"}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <BroadcastSheet
          onClose={() => setShowForm(false)}
          onSent={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function BroadcastSheet({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [form, setForm] = useState({
    channel: "EMAIL" as CommChannel,
    recipientType: "ALL" as RecipientType,
    templateId: "",
    subject: "",
    body: "",
  });
  const [selectedUsers, setSelectedUsers] = useState<Customer[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inp = "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]";

  useEffect(() => {
    commTemplateService.getAll(form.channel).then((data: any) => {
      setTemplates(Array.isArray(data) ? data : data?.data ?? []);
    }).catch(() => {});
  }, [form.channel]);

  const handleTemplateSelect = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    setForm(f => ({
      ...f,
      templateId: id,
      subject: tpl?.subject ?? f.subject,
      body: tpl?.body ?? f.body,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await broadcastService.send({
        channel: form.channel,
        recipientType: form.recipientType,
        subject: form.subject,
        body: form.body,
        templateId: form.templateId || undefined,
        accountIds: form.recipientType === "SELECTED" ? selectedUsers.map(u => u.id) : undefined,
      });
      onSent();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">New Broadcast</div>
            <div className="text-[15px] font-semibold">Send Message</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Channel *</label>
              <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value as CommChannel, templateId: "", subject: "", body: "" }))} className={inp}>
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Recipients *</label>
              <select value={form.recipientType} onChange={e => setForm(f => ({ ...f, recipientType: e.target.value as RecipientType }))} className={inp}>
                <option value="ALL">All Users</option>
                <option value="SELECTED">Selected Users</option>
              </select>
            </div>

            {form.recipientType === "SELECTED" && (
              <UserPicker selected={selectedUsers} onChange={setSelectedUsers} />
            )}

            {templates.length > 0 && (
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Use Template <span className="text-[#9CA3AF]">(optional)</span></label>
                <select value={form.templateId} onChange={e => handleTemplateSelect(e.target.value)} className={inp}>
                  <option value="">— Select a template —</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Subject / Title *</label>
              <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Special offer just for you!" className={inp} />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#374151]">Message Body *</label>
              <textarea
                required rows={8}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write your message here…"
                className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151]">Cancel</button>
            <button type="submit" disabled={sending} className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-60">
              <Send className="h-3 w-3" /> {sending ? "Sending…" : "Send Broadcast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserPicker({ selected, onChange }: { selected: Customer[]; onChange: (u: Customer[]) => void }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 10;

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await customersService.getAll({ page: p, limit: LIMIT, search: search || undefined });
      setUsers(res?.data?.data ?? res?.data ?? []);
      setTotal(res?.data?.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1, q); setPage(1); }, [q]);
  useEffect(() => { load(page, q); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const isSelected = (id: string) => selected.some(s => s.id === id);

  const toggle = (u: Customer) => {
    if (isSelected(u.id)) onChange(selected.filter(s => s.id !== u.id));
    else onChange([...selected, u]);
  };

  const toggleAll = () => {
    const allSelected = users.every(u => isSelected(u.id));
    if (allSelected) onChange(selected.filter(s => !users.find(u => u.id === s.id)));
    else {
      const toAdd = users.filter(u => !isSelected(u.id));
      onChange([...selected, ...toAdd]);
    }
  };

  const allOnPageSelected = users.length > 0 && users.every(u => isSelected(u.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[#374151]">
          Select Users * <span className="text-[#9CA3AF]">({selected.length} selected)</span>
        </label>
        {selected.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-[10px] text-red-500 hover:underline">Clear all</button>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-2 max-h-20 overflow-y-auto">
          {selected.map(u => (
            <span key={u.id} className="flex items-center gap-1 rounded-full bg-[#111827] px-2 py-0.5 text-[11px] text-white">
              <UserCheck className="h-3 w-3" />
              {u.name || u.loginId}
              <button type="button" onClick={() => toggle(u)} className="ml-0.5 hover:text-red-300"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
        />
      </div>

      {/* User list */}
      <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden">
        {/* Select all on page */}
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] bg-[#FAFAF9] px-3 py-1.5">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            onChange={toggleAll}
            className="h-3.5 w-3.5 rounded"
          />
          <span className="text-[11px] text-[#6B7280]">
            {allOnPageSelected ? "Deselect" : "Select"} all on this page
          </span>
        </div>

        <div className="max-h-52 overflow-y-auto">
          {loading && <div className="px-3 py-4 text-center text-[12px] text-[#6B7280]">Loading…</div>}
          {!loading && users.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-[#6B7280]">No users found.</div>}
          {!loading && users.map(u => (
            <label
              key={u.id}
              className="flex cursor-pointer items-center gap-2.5 border-b border-[#F3F4F6] px-3 py-2 last:border-0 hover:bg-[#F9FAFB]"
            >
              <input
                type="checkbox"
                checked={isSelected(u.id)}
                onChange={() => toggle(u)}
                className="h-3.5 w-3.5 rounded shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[12px] font-medium truncate">{u.name || "—"}</div>
                <div className="text-[10px] text-[#6B7280] truncate">{u.loginId}{u.email ? ` · ${u.email}` : ""}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-1.5 text-[11px] text-[#6B7280]">
          <span>{total} total users</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded border border-[#E5E7EB] px-2 py-0.5 disabled:opacity-40">‹</button>
            <span>{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded border border-[#E5E7EB] px-2 py-0.5 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
