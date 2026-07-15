import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";
import type { Order } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/orders/cancellations")({ component: CancellationsPage });

const LIMIT = 20;

const PAYMENT_COLOR: Record<string, string> = {
  SUCCESS:           "bg-[#DCFCE7] text-[#166534]",
  PENDING:           "bg-[#FEF9C3] text-[#854D0E]",
  FAILED:            "bg-[#FEE2E2] text-[#991B1B]",
  CANCELLED:         "bg-[#F3F4F6] text-[#4B5563]",
  REFUNDED:          "bg-[#EDE9FE] text-[#5B21B6]",
  REFUND_PROCESSING: "bg-[#E0E7FF] text-[#3730A3]",
};

function PaymentBadge({ status }: { status: string }) {
  const color = PAYMENT_COLOR[status] ?? "bg-[#F3F4F6] text-[#4B5563]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function CancellationsPage() {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.orders);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const load = (p = page, search = q) => {
    dispatch(fetchOrders({ page: p, limit: LIMIT, status: "CANCELLED", ...(search ? { search } : {}) }));
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const refundStats = {
    refunded: items.filter((o) => o.paymentStatus === "REFUNDED").length,
    processing: items.filter((o) => o.paymentStatus === "REFUND_PROCESSING").length,
    notPaid: items.filter((o) => ["CANCELLED", "PENDING", "FAILED"].includes(o.paymentStatus)).length,
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Orders</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Cancellations</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">All cancelled orders and their refund status.</p>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total Cancelled", value: total, color: "text-[#111827]" },
          { label: "Refunded", value: refundStats.refunded, color: "text-[#5B21B6]" },
          { label: "Refund Processing", value: refundStats.processing, color: "text-[#3730A3]" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] text-[#6B7280]">{c.label}</div>
            <div className={`mt-1 text-[22px] font-semibold tabular-nums ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Search */}
        <div className="border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search order number…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Order #</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Paid</th>
                <th className="px-3 py-2 text-left">Refund Status</th>
                <th className="px-3 py-2 text-left">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">No cancelled orders found.</td></tr>}
              {!loading && items.map((o: Order) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5 text-[#4B5563] tabular-nums">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.fullName ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">₹{Number(o.totalAmount).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-[#4B5563]">₹{Number(o.paidAmount).toFixed(2)}</td>
                  <td className="px-3 py-2.5"><PaymentBadge status={o.paymentStatus} /></td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{o.transactionId ?? "—"}</td>
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`rounded-md px-2 py-1 ${p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]"}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
