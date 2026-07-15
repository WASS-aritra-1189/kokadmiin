import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, X, MessageSquare, ChevronDown } from "lucide-react";
import {
  supportTicketService,
  type SupportTicket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
} from "@/services/support-ticket.service";

export const Route = createFileRoute("/_admin/customers/tickets")({
  component: SupportTicketsPage,
});

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: "bg-[#DBEAFE] text-[#1D4ED8]",
  IN_PROGRESS: "bg-[#FEF9C3] text-[#854D0E]",
  RESOLVED: "bg-[#DCFCE7] text-[#166534]",
  CLOSED: "bg-[#F3F4F6] text-[#4B5563]",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: "bg-[#F3F4F6] text-[#4B5563]",
  MEDIUM: "bg-[#FEF9C3] text-[#854D0E]",
  HIGH: "bg-[#FEE2E2] text-[#991B1B]",
  URGENT: "bg-[#FEE2E2] text-[#7F1D1D] font-semibold",
};

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES: TicketCategory[] = ["ORDER", "PAYMENT", "DELIVERY", "RETURN", "PRODUCT", "ACCOUNT", "OTHER"];

function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "">("");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const limit = 20;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supportTicketService.getAll({
        page,
        limit,
        search: q || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      });
      setTickets(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [page, q, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    const t = setTimeout(fetchTickets, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchTickets, q]);

  const totalPages = Math.ceil(total / limit);

  const handleTicketUpdated = (updated: SupportTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(updated);
  };

  const handleTicketDeleted = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setSelected(null);
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Customers</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Support Tickets</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} tickets</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search subject or description…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v as TicketStatus | ""); setPage(1); }} options={STATUSES} placeholder="All Statuses" />
          <FilterSelect value={priorityFilter} onChange={(v) => { setPriorityFilter(v as TicketPriority | ""); setPage(1); }} options={PRIORITIES} placeholder="All Priorities" />
          <FilterSelect value={categoryFilter} onChange={(v) => { setCategoryFilter(v as TicketCategory | ""); setPage(1); }} options={CATEGORIES} placeholder="All Categories" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading tickets…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-500 text-[13px]">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF]">
            <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
            <span className="text-[13px]">No tickets found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Priority</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Replies</th>
                  <th className="px-3 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="cursor-pointer border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]"
                  >
                    <td className="px-3 py-2 max-w-[260px]">
                      <div className="font-medium truncate">{t.subject}</div>
                      <div className="text-[10px] text-[#6B7280] truncate">{t.accountId}</div>
                    </td>
                    <td className="px-3 py-2 text-[#4B5563]">{t.category}</td>
                    <td className="px-3 py-2">
                      <Chip label={t.priority} color={PRIORITY_COLORS[t.priority]} />
                    </td>
                    <td className="px-3 py-2">
                      <Chip label={t.status.replace("_", " ")} color={STATUS_COLORS[t.status]} />
                    </td>
                    <td className="px-3 py-2 text-[#4B5563]">{t.replies?.length ?? 0}</td>
                    <td className="px-3 py-2 text-[#4B5563]">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5E7EB] px-3 py-2">
            <span className="text-[11px] text-[#6B7280]">Page {page} of {totalPages} · {total} total</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]">Next</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <TicketDrawer
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleTicketUpdated}
          onDeleted={handleTicketDeleted}
        />
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 appearance-none rounded-md border border-[#E5E7EB] bg-white pl-2 pr-6 text-[12px] text-[#374151] outline-none focus:border-[#4F46E5]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>{label}</span>;
}

function TicketDrawer({ ticket, onClose, onUpdated, onDeleted }: {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdated: (t: SupportTicket) => void;
  onDeleted: (id: string) => void;
}) {
  const [detail, setDetail] = useState<SupportTicket>({ ...ticket, replies: ticket.replies ?? [] });
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status);
  const [newPriority, setNewPriority] = useState<TicketPriority>(ticket.priority);
  const [adminNote, setAdminNote] = useState(ticket.adminNote ?? "");

  useEffect(() => {
    setDetailLoading(true);
    setDetailError(null);
    supportTicketService
      .getById(ticket.id)
      .then((res: any) => {
        if (res && typeof res === "object" && "id" in res) {
          setDetail({ ...res, replies: res.replies ?? [] });
        } else {
          setDetailError("Unexpected response from server.");
        }
      })
      .catch(() => setDetailError("Failed to load ticket details."))
      .finally(() => setDetailLoading(false));
  }, [ticket.id]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    setReplyError(null);
    try {
      await supportTicketService.reply(detail.id, replyText.trim());
      const updated: any = await supportTicketService.getById(detail.id);
      const safe = { ...updated, replies: updated.replies ?? [] };
      setDetail(safe);
      onUpdated(safe);
      setReplyText("");
    } catch {
      setReplyError("Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async () => {
    setStatusUpdating(true);
    try {
      const patch: any = await supportTicketService.updateStatus(detail.id, {
        status: newStatus,
        priority: newPriority,
        adminNote: adminNote || undefined,
      });
      const updated = { ...detail, ...patch, replies: detail.replies };
      setDetail(updated);
      onUpdated(updated);
    } catch {
      // silent
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await supportTicketService.delete(detail.id);
      onDeleted(detail.id);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Chip label={detail.status.replace("_", " ")} color={STATUS_COLORS[detail.status]} />
              <Chip label={detail.priority} color={PRIORITY_COLORS[detail.priority]} />
              <span className="text-[10px] text-[#9CA3AF]">{detail.category}</span>
            </div>
            <div className="mt-1.5 text-[15px] font-semibold leading-snug truncate">{detail.subject}</div>
            <div className="mt-0.5 text-[11px] text-[#6B7280]">Account: {detail.accountId}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {detailError ? (
            <div className="flex items-center justify-center py-16 text-red-500 text-[13px] px-5">{detailError}</div>
          ) : (
            <>
              {/* Description */}
              <div className="border-b border-[#F3F4F6] px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">Description</div>
                <p className="text-[13px] text-[#374151] whitespace-pre-wrap">{detail.description}</p>
              </div>

              {/* Replies */}
              <div className="border-b border-[#F3F4F6] px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
                  Replies ({detail.replies.length})
                </div>
                {detailLoading ? (
                  <div className="flex items-center gap-2 text-[#6B7280] text-[12px]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading replies…
                  </div>
                ) : detail.replies.length === 0 ? (
                  <p className="text-[12px] text-[#9CA3AF]">No replies yet.</p>
                ) : (
                  <div className="space-y-3">
                    {detail.replies.map((r) => (
                      <div
                        key={r.id}
                        className={`rounded-lg p-3 text-[12px] ${r.isAdmin ? "bg-[#EEF2FF] ml-4" : "bg-[#F9FAFB] mr-4"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold ${r.isAdmin ? "text-[#4F46E5]" : "text-[#374151]"}`}>
                            {r.isAdmin ? "Admin" : "Customer"}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[#374151] whitespace-pre-wrap">{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply box */}
                <div className="mt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    rows={3}
                    className="w-full rounded-md border border-[#E5E7EB] p-2 text-[12px] outline-none focus:border-[#4F46E5] resize-none"
                  />
                  {replyError && <p className="mt-1 text-[11px] text-red-500">{replyError}</p>}
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="mt-1.5 h-8 rounded-md bg-[#4F46E5] px-4 text-[12px] font-medium text-white disabled:opacity-50 hover:bg-[#4338CA]"
                  >
                    {replying ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>

              {/* Admin controls */}
              <div className="px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">Admin Controls</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#6B7280] mb-1 block">Status</label>
                    <div className="relative">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                        className="h-8 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white pl-2 pr-6 text-[12px] outline-none focus:border-[#4F46E5]"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#6B7280] mb-1 block">Priority</label>
                    <div className="relative">
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                        className="h-8 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white pl-2 pr-6 text-[12px] outline-none focus:border-[#4F46E5]"
                      >
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-[11px] text-[#6B7280] mb-1 block">Admin Note</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Internal note (not visible to customer)…"
                    rows={2}
                    className="w-full rounded-md border border-[#E5E7EB] p-2 text-[12px] outline-none focus:border-[#4F46E5] resize-none"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={statusUpdating}
                    className="h-8 rounded-md bg-[#4F46E5] px-4 text-[12px] font-medium text-white disabled:opacity-50 hover:bg-[#4338CA]"
                  >
                    {statusUpdating ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-8 rounded-md border border-[#FCA5A5] px-4 text-[12px] font-medium text-[#EF4444] disabled:opacity-50 hover:bg-[#FEF2F2]"
                  >
                    {deleting ? "Deleting…" : "Delete Ticket"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
