import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, PackageCheck, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { ordersService, type ReturnRequest, type ReturnRequestStatus } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/orders/returns")({ component: ReturnsPage });

const STATUSES: ReturnRequestStatus[] = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

const STATUS_COLOR: Record<ReturnRequestStatus, string> = {
  PENDING:   "bg-[#FEF9C3] text-[#854D0E]",
  APPROVED:  "bg-[#DBEAFE] text-[#1E40AF]",
  REJECTED:  "bg-[#FEE2E2] text-[#991B1B]",
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
};

function StatusBadge({ status }: { status: ReturnRequestStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[status]}`}>
      {status}
    </span>
  );
}

function ReturnsPage() {
  const [tab, setTab] = useState<"ALL" | ReturnRequestStatus>("ALL");
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const load = async (status?: ReturnRequestStatus) => {
    setLoading(true);
    try {
      const res = await ordersService.getAllReturns(status);
      setItems(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab === "ALL" ? undefined : tab); }, [tab]);

  const act = async (orderId: string, requestId: string, action: "approve" | "reject" | "complete" | "pickup") => {
    setBusy(requestId + action);
    setMsg(null);
    try {
      const note = actionNote[requestId];
      if (action === "approve") await ordersService.approveReturn(orderId, note);
      else if (action === "reject") await ordersService.rejectReturn(orderId, note);
      else if (action === "complete") await ordersService.completeReturn(orderId);
      else await ordersService.scheduleReturnPickup(orderId);
      setMsg({ id: requestId, text: `Return ${action === "pickup" ? "pickup scheduled" : action + "d"} successfully.`, ok: true });
      load(tab === "ALL" ? undefined : tab);
    } catch (err: any) {
      setMsg({ id: requestId, text: err.response?.data?.message ?? `Failed to ${action} return.`, ok: false });
    } finally {
      setBusy(null);
    }
  };

  const filtered = tab === "ALL" ? items : items.filter((r) => r.status === tab);
  const counts: Record<string, number> = { ALL: items.length };
  STATUSES.forEach((s) => { counts[s] = items.filter((r) => r.status === s).length; });

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Orders</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Returns</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">Review and action customer return requests.</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-2">
          {(["ALL", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[12px] font-medium ${tab === s ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
            >
              {s}
              <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {loading && <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">Loading…</div>}
        {!loading && filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">No return requests found.</div>
        )}

        {!loading && filtered.map((r) => (
          <div key={r.id} className="border-b border-[#F3F4F6] last:border-0">
            <div
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[#FAFAF9]"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-semibold text-[#4F46E5]">
                    {r.order?.orderNumber ?? r.orderId.slice(0, 8)}
                  </span>
                  <StatusBadge status={r.status} />
                  <span className="text-[11px] text-[#6B7280]">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-[#374151] truncate">
                  {r.reason ?? "No reason provided"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-semibold">₹{Number(r.refundAmount).toFixed(2)}</div>
                <div className="text-[10px] text-[#6B7280]">{r.items.length} item{r.items.length !== 1 ? "s" : ""}</div>
              </div>
              {expanded === r.id ? <ChevronUp className="h-4 w-4 text-[#6B7280] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#6B7280] shrink-0" />}
            </div>

            {expanded === r.id && (
              <div className="border-t border-[#F3F4F6] bg-[#FAFAF9] px-4 py-4 space-y-4">
                {/* Items table */}
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                      <th className="pb-1 text-left">Book</th>
                      <th className="pb-1 text-right">Qty</th>
                      <th className="pb-1 text-right">Price</th>
                      <th className="pb-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.items.map((item, i) => (
                      <tr key={i} className="border-t border-[#F3F4F6]">
                        <td className="py-1.5">
                          <div className="font-medium">{item.bookTitle}</div>
                          <div className="font-mono text-[10px] text-[#9CA3AF]">{item.bookId}</div>
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{item.quantity}</td>
                        <td className="py-1.5 text-right tabular-nums">₹{Number(item.price).toFixed(2)}</td>
                        <td className="py-1.5 text-right font-medium tabular-nums">₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pickup / shipment info */}
                {(r.returnAwb || r.returnPickupStatus) && (
                  <div className="flex gap-4 text-[11px] text-[#6B7280]">
                    {r.returnAwb && <span>Return AWB: <span className="font-mono text-[#374151]">{r.returnAwb}</span></span>}
                    {r.returnPickupStatus && <span>Pickup: <span className="text-[#374151]">{r.returnPickupStatus}</span></span>}
                    {r.pickupScheduledAt && <span>Scheduled: {new Date(r.pickupScheduledAt).toLocaleString("en-IN")}</span>}
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex gap-6 text-[11px] text-[#6B7280]">
                  {r.approvedAt && <span>Approved: {new Date(r.approvedAt).toLocaleString("en-IN")}</span>}
                  {r.completedAt && <span>Completed: {new Date(r.completedAt).toLocaleString("en-IN")}</span>}
                  {r.adminNote && <span>Note: <span className="text-[#374151]">{r.adminNote}</span></span>}
                </div>

                {/* Feedback */}
                {msg?.id === r.id && (
                  <div className={`rounded-md border px-3 py-2 text-[12px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>
                    {msg.text}
                  </div>
                )}

                {/* Actions — PENDING */}
                {r.status === "PENDING" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      placeholder="Admin note (optional)"
                      value={actionNote[r.id] ?? ""}
                      onChange={(e) => setActionNote((p) => ({ ...p, [r.id]: e.target.value }))}
                      className="h-8 flex-1 min-w-[180px] rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]"
                    />
                    <button
                      disabled={busy === r.id + "approve"}
                      onClick={() => act(r.orderId, r.id, "approve")}
                      className="flex items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-60"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {busy === r.id + "approve" ? "Approving…" : "Approve"}
                    </button>
                    <button
                      disabled={busy === r.id + "reject"}
                      onClick={() => act(r.orderId, r.id, "reject")}
                      className="flex items-center gap-1.5 rounded-md bg-[#DC2626] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-60"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {busy === r.id + "reject" ? "Rejecting…" : "Reject"}
                    </button>
                  </div>
                )}

                {/* Actions — APPROVED */}
                {r.status === "APPROVED" && (
                  <div className="flex flex-wrap gap-2">
                    {!r.returnShipmentId && (
                      <button
                        disabled={busy === r.id + "pickup"}
                        onClick={() => act(r.orderId, r.id, "pickup")}
                        className="flex items-center gap-1.5 rounded-md bg-[#7C3AED] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-60"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        {busy === r.id + "pickup" ? "Scheduling…" : "Schedule Return Pickup"}
                      </button>
                    )}
                    {r.returnShipmentId && (
                      <button
                        disabled={busy === r.id + "complete"}
                        onClick={() => act(r.orderId, r.id, "complete")}
                        className="flex items-center gap-1.5 rounded-md bg-[#16A34A] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-60"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        {busy === r.id + "complete" ? "Processing…" : "Mark Received & Refund"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
