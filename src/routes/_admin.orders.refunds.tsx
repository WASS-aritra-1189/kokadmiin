import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ordersService, type Refund } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/orders/refunds")({ component: RefundsPage });

type RefundStatus = Refund["refundStatus"];

const STATUS_COLOR: Record<RefundStatus, string> = {
  COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  PROCESSED: "bg-[#DBEAFE] text-[#1E40AF]",
  PENDING:   "bg-[#FEF9C3] text-[#854D0E]",
  FAILED:    "bg-[#FEE2E2] text-[#991B1B]",
};

const TYPE_COLOR: Record<string, string> = {
  ORDER:    "bg-[#F0F9FF] text-[#0369A1]",
  EXCHANGE: "bg-[#EDE9FE] text-[#5B21B6]",
  RETURN:   "bg-[#F0FDF4] text-[#166534]",
};

function StatusBadge({ status }: { status: RefundStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[status] ?? "bg-[#F3F4F6] text-[#4B5563]"}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLOR[type] ?? "bg-[#F3F4F6] text-[#4B5563]"}`}>
      {type}
    </span>
  );
}

const STATUSES: RefundStatus[] = ["COMPLETED", "PROCESSED", "PENDING", "FAILED"];

export default function RefundsPage() {
  const [all, setAll] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"ALL" | RefundStatus>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    ordersService.getAllRefunds()
      .then((res) => setAll(res.data ?? res ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = all.filter((r) => {
    const matchTab = tab === "ALL" || r.refundStatus === tab;
    const matchQ = !q ||
      r.account?.loginId?.toLowerCase().includes(q.toLowerCase()) ||
      r.razorpayRefundId?.toLowerCase().includes(q.toLowerCase()) ||
      r.razorpayPaymentId?.toLowerCase().includes(q.toLowerCase());
    return matchTab && matchQ;
  });

  const counts: Record<string, number> = { ALL: all.length };
  STATUSES.forEach((s) => { counts[s] = all.filter((r) => r.refundStatus === s).length; });

  const totalRefunded = all
    .filter((r) => r.refundStatus === "COMPLETED" || r.refundStatus === "PROCESSED")
    .reduce((sum, r) => sum + Number(r.refundAmount), 0);

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Orders</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Refunds</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">All refunds issued — from cancellations, returns and exchanges.</p>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {[
          { label: "Total Refunds", value: all.length, color: "text-[#111827]" },
          { label: "Completed", value: counts["COMPLETED"] ?? 0, color: "text-[#166534]" },
          { label: "Processing", value: counts["PROCESSED"] ?? 0, color: "text-[#1E40AF]" },
          { label: "Total Amount", value: `₹${totalRefunded.toFixed(2)}`, color: "text-[#5B21B6]" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] text-[#6B7280]">{c.label}</div>
            <div className={`mt-1 text-[20px] font-semibold tabular-nums ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
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

        {/* Search */}
        <div className="border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by customer, payment ID or refund ID…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Razorpay Payment ID</th>
                <th className="px-3 py-2 text-left">Razorpay Refund ID</th>
                <th className="px-3 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">No refunds found.</td></tr>
              )}
              {!loading && filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 tabular-nums text-[#4B5563]">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    <div className="text-[10px] text-[#9CA3AF]">{new Date(r.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                  </td>
                  <td className="px-3 py-2.5 font-medium">{r.account?.loginId ?? "—"}</td>
                  <td className="px-3 py-2.5"><TypeBadge type={r.refundType} /></td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">₹{Number(r.refundAmount).toFixed(2)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={r.refundStatus} /></td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{r.razorpayPaymentId ?? "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{r.razorpayRefundId ?? "—"}</td>
                  <td className="px-3 py-2.5 max-w-[200px] truncate text-[#4B5563]" title={r.reason ?? ""}>{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          Showing <span className="font-medium text-[#111827]">{filtered.length}</span> of {all.length}
        </div>
      </div>
    </div>
  );
}
