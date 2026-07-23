import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, X, ExternalLink, IndianRupee } from "lucide-react";
import { transactionsService, type Transaction, type TransactionStats } from "@/services/transactions.service";

export const Route = createFileRoute("/_admin/payments/transactions/")({
  component: TransactionsPage,
});

const LIMIT = 10;

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "RETURNED"];
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "REFUND_INITIATED", "CANCELLED"];

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-[#FEF9C3] text-[#854D0E]",
  CONFIRMED:  "bg-[#DBEAFE] text-[#1E40AF]",
  PROCESSING: "bg-[#E0E7FF] text-[#3730A3]",
  SHIPPED:    "bg-[#CFFAFE] text-[#155E75]",
  DELIVERED:  "bg-[#DCFCE7] text-[#166534]",
  CANCELLED:  "bg-[#F3F4F6] text-[#4B5563]",
  REFUNDED:   "bg-[#EDE9FE] text-[#5B21B6]",
  RETURNED:   "bg-[#FCE7F3] text-[#9D174D]",
};

const PAYMENT_COLOR: Record<string, string> = {
  PENDING:          "bg-[#FEF9C3] text-[#854D0E]",
  SUCCESS:          "bg-[#DCFCE7] text-[#166534]",
  FAILED:           "bg-[#FEE2E2] text-[#991B1B]",
  REFUNDED:         "bg-[#EDE9FE] text-[#5B21B6]",
  REFUND_INITIATED: "bg-[#EDE9FE] text-[#5B21B6]",
  CANCELLED:        "bg-[#F3F4F6] text-[#4B5563]",
};

const METHOD_COLOR: Record<string, string> = {
  RAZORPAY: "bg-[#0EA5E9] text-white",
  COD:      "bg-[#F59E0B] text-white",
  CARD:     "bg-[#8B5CF6] text-white",
  UPI:      "bg-[#10B981] text-white",
};

function StatusBadge({ status, colorMap = STATUS_COLOR }: { status: string; colorMap?: Record<string, string> }) {
  const color = colorMap[status] ?? "bg-[#F3F4F6] text-[#4B5563]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatsCards({ stats }: { stats?: TransactionStats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Total Collected</div>
        <div className="mt-1 text-[20px] font-semibold text-[#166534]">₹{Number(stats.totalCollected).toFixed(2)}</div>
        <div className="mt-1 text-[10px] text-[#6B7280]">{stats.successCount} successful payments</div>
      </div>
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Total Pending</div>
        <div className="mt-1 text-[20px] font-semibold text-[#854D0E]">₹{Number(stats.totalPending).toFixed(2)}</div>
        <div className="mt-1 text-[10px] text-[#6B7280]">{stats.pendingCount} pending payments</div>
      </div>
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Total Refunded</div>
        <div className="mt-1 text-[20px] font-semibold text-[#5B21B6]">₹{Number(stats.totalRefunded).toFixed(2)}</div>
        <div className="mt-1 text-[10px] text-[#6B7280]">{stats.refundedCount} refunded</div>
      </div>
    </div>
  );
}

function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [data, setData] = useState<{ data: Transaction[]; total: number; stats?: TransactionStats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const load = async (p = page, search = q, os = orderStatus, ps = paymentStatus) => {
    setLoading(true);
    try {
      const res = await transactionsService.findAll({
        page: p,
        limit: LIMIT,
        ...(search ? { search } : {}),
        ...(os ? { orderStatus: os } : {}),
        ...(ps ? { paymentStatus: ps } : {}),
      });
      setData(res ?? { data: [], total: 0, stats: undefined });
    } catch (e) {
      console.error(e);
      setData({ data: [], total: 0, stats: undefined });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, orderStatus, paymentStatus]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Payments</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">View all payment transactions and their status.</p>
        </div>
      </div>

      <StatsCards stats={data?.stats} />

      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] px-3 py-2.5">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q, orderStatus, paymentStatus); } }}
              placeholder="Search order, customer, transaction..."
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <select
            value={orderStatus}
            onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Order Status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Payment Status</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Order #</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Method</th>
                <th className="px-3 py-2 text-left">Payment</th>
                <th className="px-3 py-2 text-left">Order Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && (!data?.data || data.data.length === 0) && <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">No transactions found.</td></tr>}
              {!loading && data?.data.map((t) => (
                <tr key={t.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{t.orderNumber}</td>
                  <td className="px-3 py-2.5 text-[#4B5563] tabular-nums">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{t.customerName || "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{t.customerEmail || ""}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">₹{Number(t.amount).toFixed(2)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${METHOD_COLOR[t.paymentMethod] ?? "bg-[#F3F4F6] text-[#4B5563]"}`}>
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={t.paymentStatus} colorMap={PAYMENT_COLOR} /></td>
                  <td className="px-3 py-2.5"><StatusBadge status={t.orderStatus} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => setSelected(t)}
                      className="rounded-md border border-[#E5E7EB] p-1 text-[#374151] hover:bg-[#F9FAFB]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div>Showing <span className="font-medium text-[#111827]">{data?.data?.length ?? 0}</span> of {data?.total ?? 0}</div>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`rounded-md px-2 py-1 ${p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]"}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selected && <TransactionDrawer transaction={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Transaction Detail Drawer ──────────────────────────────────────────────────────

function TransactionDrawer({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const sub = transaction.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] py-1.5 last:border-0">
      <span className="shrink-0 text-[11px] text-[#6B7280]">{label}</span>
      <span className="text-right text-[12px] font-medium">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-semibold text-[#4F46E5]">{transaction.orderNumber}</span>
              <StatusBadge status={transaction.orderStatus} />
            </div>
            <div className="mt-0.5 text-[11px] text-[#6B7280]">
              {new Date(transaction.createdAt).toLocaleString("en-IN")} · <StatusBadge status={transaction.paymentStatus} colorMap={PAYMENT_COLOR} />
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto p-5">
          {/* Left: items + totals */}
          <div className="col-span-2 space-y-4">
            {/* Line items */}
            <section className="rounded-lg border border-[#E5E7EB]">
              <div className="border-b border-[#F3F4F6] px-4 py-2.5 text-[12px] font-semibold">Line Items</div>
              {transaction.orderItems.length > 0 ? (
                <table className="w-full text-[12px]">
                  <tbody>
                    {transaction.orderItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-[#F3F4F6]">
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{item.bookTitle}</div>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-[#4B5563]">
                          {item.quantity} × ₹{Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-4 py-3 text-[12px] text-[#6B7280]">No items loaded.</div>
              )}
              <div className="border-t border-[#F3F4F6] px-4 py-3">
                <div className="ml-auto max-w-xs space-y-1 text-[12px]">
                  <div className="flex justify-between text-[#4B5563]">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-[#111827]">₹{sub.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 border-t border-[#F3F4F6] pt-2">
                    <div className="flex justify-between text-[14px] font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums text-[#111827]">₹{Number(transaction.amount).toFixed(2)}</span>
                    </div>
                  </div>
                  {Number(transaction.paidAmount) > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#F3F4F6]">
                      <div className="flex justify-between text-[#166534]">
                        <span>Paid</span>
                        <span className="tabular-nums">₹{Number(transaction.paidAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right: customer + address + payment */}
          <div className="space-y-4">
            <section className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Customer</div>
              <div className="mt-1 text-[13px] font-semibold">{transaction.customerName || "—"}</div>
              <div className="mt-1 text-[11px] text-[#6B7280]">{transaction.customerEmail}</div>
              <div className="mt-1 text-[11px] text-[#6B7280]">{transaction.customerPhone}</div>
            </section>

            <section className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Shipping Address</div>
              {transaction.shippingAddress ? (
                <div className="mt-1 text-[12px] leading-relaxed text-[#111827]">
                  {transaction.shippingAddress.fullName}<br />
                  {transaction.shippingAddress.addressLine1}<br />
                  {transaction.shippingAddress.addressLine2 && <>{transaction.shippingAddress.addressLine2}<br /></>}
                  {transaction.shippingAddress.city}, {transaction.shippingAddress.state} {transaction.shippingAddress.pincode}<br />
                  {transaction.shippingAddress.phone}
                </div>
              ) : (
                <div className="mt-1 text-[12px] text-[#6B7280]">—</div>
              )}
            </section>

            <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">Payment Details</div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6B7280]">Method</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${METHOD_COLOR[transaction.paymentMethod] ?? "bg-[#F3F4F6] text-[#4B5563]"}`}>
                  {transaction.paymentMethod}
                </span>
              </div>
              {row("Transaction ID", transaction.transactionId)}
              {row("Payment ID", transaction.paymentId)}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}