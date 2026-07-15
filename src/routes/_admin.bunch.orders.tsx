import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, X, ExternalLink } from "lucide-react";
import { bunchOrderService, type BunchOrder } from "@/services/bunch.service";

export const Route = createFileRoute("/_admin/bunch/orders")({ component: Page });

const LIMIT = 10;

const PAYMENT_COLOR: Record<string, string> = {
  SUCCESS: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF9C3] text-[#854D0E]",
  FAILED: "bg-[#FEE2E2] text-[#991B1B]",
  CANCELLED: "bg-[#F3F4F6] text-[#4B5563]",
  REFUNDED: "bg-[#E0E7FF] text-[#3730A3]",
  REFUND_PROCESSING: "bg-[#EDE9FE] text-[#5B21B6]",
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-[#FEF9C3] text-[#854D0E]",
  CONFIRMED: "bg-[#DBEAFE] text-[#1E40AF]",
  PROCESSING: "bg-[#E0E7FF] text-[#3730A3]",
  PICKUP_SCHEDULED: "bg-[#FEF3C7] text-[#92400E]",
  PICKED_UP: "bg-[#D1FAE5] text-[#065F46]",
  IN_TRANSIT: "bg-[#CFFAFE] text-[#155E75]",
  OUT_FOR_DELIVERY: "bg-[#FEE2E2] text-[#991B1B]",
  DELIVERED: "bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "bg-[#F3F4F6] text-[#4B5563]",
  RETURNED: "bg-[#FEE2E2] text-[#991B1B]",
  FAILED: "bg-[#FEE2E2] text-[#991B1B]",
};

function Page() {
  const [items, setItems] = useState<BunchOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<BunchOrder | null>(null);

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await bunchOrderService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Bunch</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Bunch Orders</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">All bunch purchase orders with payment and shipping status.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {[
          ["Total", total],
          ["Confirmed", items.filter(i => i.orderStatus === "CONFIRMED" || i.orderStatus === "PROCESSING").length],
          ["In Transit", items.filter(i => ["PICKUP_SCHEDULED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY"].includes(i.orderStatus)).length],
          ["Delivered", items.filter(i => i.orderStatus === "DELIVERED").length],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{l}</div>
            <div className="mt-1 text-[22px] font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search orders…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-4 py-2 text-left">Order #</th>
                <th className="px-4 py-2 text-left">Bunch</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Order Status</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-left">AWB</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-[#6B7280]">No orders found.</td></tr>}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-2.5 font-mono font-medium text-[#4F46E5]">{item.orderNumber}</td>
                  <td className="px-4 py-2.5">{item.bunch?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{item.account?.loginId ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{Number(item.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (ORDER_STATUS_COLOR[item.orderStatus] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                      {item.orderStatus?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (PAYMENT_COLOR[item.paymentStatus] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B7280] font-mono">{item.awb ?? "—"}</td>
                  <td className="px-4 py-2.5 text-[#6B7280]">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setDetail(item)}
                      className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div>Showing <span className="font-medium text-[#111827]">{items.length}</span> of {total}</div>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={"rounded-md px-2 py-1 " + (p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetail({ order, onClose }: { order: BunchOrder; onClose: () => void }) {
  const [pickupDate, setPickupDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handlePickup = async () => {
    if (!pickupDate) return;
    setScheduling(true);
    setMsg(null);
    try {
      await bunchOrderService.schedulePickup(order.id, pickupDate);
      setMsg("Pickup scheduled successfully.");
    } catch (err: any) {
      setMsg(err.response?.data?.message ?? "Failed to schedule pickup.");
    } finally { setScheduling(false); }
  };

  const row = (label: string, value: any) => (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-[11px] text-[#6B7280] shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-right">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">Bunch Order</div>
            <div className="text-[15px] font-semibold font-mono">{order.orderNumber}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Order Details</div>
            {row("Bunch", order.bunch?.name)}
            {row("Customer", order.account?.loginId)}
            {row("Total Amount", `₹${Number(order.totalAmount).toFixed(2)}`)}
            {row("Paid Amount", `₹${Number(order.paidAmount).toFixed(2)}`)}
            {row("Order Status",
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (ORDER_STATUS_COLOR[order.orderStatus] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                {order.orderStatus?.replace(/_/g, " ") ?? "—"}
              </span>
            )}
            {row("Payment Status",
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (PAYMENT_COLOR[order.paymentStatus] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                {order.paymentStatus}
              </span>
            )}
            {row("Has Access", order.hasAccess ? "Yes" : "No")}
            {row("Date", new Date(order.createdAt).toLocaleString("en-IN"))}
          </div>

          <div className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Shipping</div>
            {row("Shipment ID", order.shipmentId)}
            {row("AWB", order.awb)}
            {row("Courier", order.courierName)}
            {row("Status", order.shipmentStatus)}
            {order.trackingUrl && (
              <div className="pt-1">
                <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#4F46E5] hover:underline flex items-center gap-1">
                  Track shipment <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {order.paymentStatus === "SUCCESS" && !order.shipmentId && (
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Schedule Pickup</div>
              {msg && <div className="mb-2 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-2 text-[12px] text-[#166534]">{msg}</div>}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="h-8 flex-1 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]"
                />
                <button
                  onClick={handlePickup}
                  disabled={scheduling || !pickupDate}
                  className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white disabled:opacity-60"
                >
                  {scheduling ? "Scheduling…" : "Schedule"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
