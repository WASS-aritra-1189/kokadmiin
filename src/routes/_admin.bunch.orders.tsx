import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, X, ExternalLink, RefreshCw } from "lucide-react";
import { bunchOrderService, type BunchOrder } from "@/services/bunch.service";

export const Route = createFileRoute("/_admin/bunch/orders")({ component: Page });

const LIMIT = 10;

const ORDER_STATUSES = [
  "PENDING", "CONFIRMED", "PROCESSING", "PICKUP_SCHEDULED", "PICKED_UP",
  "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "FAILED"
];

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

// In _admin.bunch.orders.tsx
const load = async (p = page, search = q) => {
  setLoading(true);
  try {
    const res = await bunchOrderService.getAll({ page: p ,...(search ? { search } : {}) });
    console.log("[BUNCH ORDERS] response:", res);
    // Safely extract data
    const dataArray = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setItems(dataArray);
    setTotal(res.total ?? (Array.isArray(res.data) ? res.data.length : 0));
  } catch (err) {
    console.error("[BUNCH ORDERS] load error:", err);
  } finally {
    setLoading(false);
  }
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
          ["In Transit", items.filter(i => ["PICKUP_SCHEDULED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY"].includes(i.orderStatus || "")).length],
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
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (ORDER_STATUS_COLOR[item.orderStatus || ""] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                      {item.orderStatus?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (PAYMENT_COLOR[item.paymentStatus || ""] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
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

      {detail && <OrderDrawer order={detail} onClose={() => setDetail(null)} onUpdate={() => { setDetail(null); load(); }} />}
    </div>
  );
}

// ─── Order Detail Drawer ─────────────────────────────────────────────────────

function OrderDrawer({
  order,
  onClose,
  onUpdate,
}: {
  order: BunchOrder;
  onClose: () => void;
  onUpdate?: () => void;
}) {
  const [pickupDate, setPickupDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [tracking, setTracking] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const isCODPending = order.paymentMethod === "COD" && order.paymentStatus === "PENDING";

  const handleConfirmCOD = async () => {
    if (!confirm("Confirm that payment has been received for this COD order?")) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await bunchOrderService.confirmCOD(order.id);
      setMsg({ text: "COD payment confirmed successfully!", ok: true });
      onUpdate?.();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message ?? "Failed to confirm COD payment.", ok: false });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (order.awb) void handleTrack();
  }, [order.id]);

  const handleStatusChange = async (status: string) => {
    const res = await bunchOrderService.updateStatus(order.id, status);
    setMsg({ text: `Status updated to ${status.replace(/_/g, " ")}`, ok: true });
    onUpdate?.();
  };

  const handlePickup = async () => {
    if (!pickupDate) return;
    setScheduling(true);
    setMsg(null);
    try {
      await bunchOrderService.schedulePickup(order.id, pickupDate);
      setMsg({ text: "Pickup scheduled successfully.", ok: true });
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message ?? "Failed to schedule pickup.", ok: false });
    } finally { setScheduling(false); }
  };

  const handleTrack = async () => {
    setTrackLoading(true);
    setMsg(null);
    try {
      const res = await bunchOrderService.track(order.id);
      setTracking(res);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message ?? "Failed to fetch tracking.", ok: false });
    } finally { setTrackLoading(false); }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] py-1.5 last:border-0">
      <span className="shrink-0 text-[11px] text-[#6B7280]">{label}</span>
      <span className="text-right text-[12px] font-medium">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-semibold text-[#4F46E5]">{order.orderNumber}</span>
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (ORDER_STATUS_COLOR[order.orderStatus || ""] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                {order.orderStatus?.replace(/_/g, " ") ?? "—"}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-[#6B7280]">
              {new Date(order.createdAt).toLocaleString("en-IN")} · 
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium ml-1 " + (PAYMENT_COLOR[order.paymentStatus || ""] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-5 py-2.5">
          {/* Status change dropdown */}
          <select
            disabled={loading}
            value={order.orderStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#4F46E5] disabled:opacity-60"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>

          {order.shipmentId && (
            <button
              onClick={handleTrack}
              disabled={trackLoading}
              className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${trackLoading ? "animate-spin" : ""}`} />
              Track
            </button>
          )}

          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F9FAFB]"
            >
              <ExternalLink className="h-3 w-3" />
              Tracking link
            </a>
          )}
        </div>

        {msg && (
          <div className={`mx-5 mt-3 rounded-md border px-3 py-2 text-[12px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>
            {msg.text}
          </div>
        )}

        <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto p-5">
          {/* Left: Order Details + Shipping */}
          <div className="col-span-2 space-y-4">
            {/* Bunch Details */}
            <section className="rounded-lg border border-[#E5E7EB]">
              <div className="border-b border-[#F3F4F6] px-4 py-2.5 text-[12px] font-semibold">Bunch Details</div>
              <div className="p-4">
                {row("Bunch Name", order.bunch?.name)}
                {row("Customer", order.account?.loginId)}
                {row("Total Amount", `₹${Number(order.totalAmount).toFixed(2)}`)}
                {row("Paid Amount", `₹${Number(order.paidAmount).toFixed(2)}`)}
                {row("Has Access", order.hasAccess ? "Yes" : "No")}
                {row("Date", new Date(order.createdAt).toLocaleString("en-IN"))}
              </div>
            </section>

            {/* Shipping */}
            <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Shipment</div>
              {row("Shipment ID", order.shipmentId)}
              {row("AWB", order.awb ? <span className="font-mono text-[#4F46E5]">{order.awb}</span> : null)}
              {row("Courier", order.courierName)}
              {row("Shipment Status", 
                order.shipmentStatus ? (
                  <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                    {order.shipmentStatus.replace(/_/g, " ")}
                  </span>
                ) : "—"
              )}
            </section>

            {/* COD Pending */}
            {isCODPending && (
              <section className="rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#92400E] mb-3">
                  COD Payment Pending
                </div>
                <p className="text-[12px] text-[#92400E] mb-3">
                  This is a Cash on Delivery order. Confirm when payment has been received from the customer.
                </p>
                <button
                  onClick={handleConfirmCOD}
                  disabled={loading}
                  className="h-8 rounded-md bg-[#F59E0B] px-3 text-[12px] font-medium text-white hover:bg-[#D97706] disabled:opacity-60"
                >
                  {loading ? "Confirming…" : "Confirm Payment Received"}
                </button>
              </section>
            )}

            {/* Schedule Pickup */}
            {order.paymentStatus === "SUCCESS" && !order.shipmentId && !["DELIVERED", "CANCELLED"].includes(order.orderStatus || "") && (
              <section className="rounded-lg border border-[#E5E7EB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                  Schedule Pickup
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
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
              </section>
            )}

            {/* Tracking result */}
            {trackLoading && (
              <section className="rounded-lg border border-[#E5E7EB] p-4">
                <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Fetching live tracking…
                </div>
              </section>
            )}
            {!trackLoading && tracking && (
              <section className="rounded-lg border border-[#E5E7EB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Live Tracking</div>
                <div className="space-y-0.5">
                  {tracking.status && row("Current Status", 
                    <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                      {tracking.status.replace(/_/g, " ")}
                    </span>
                  )}
                  {tracking.currentStatus && row("Description", tracking.currentStatus)}
                  {tracking.etd && row("ETD", tracking.etd)}
                  {tracking.deliveredDate && row("Delivered", tracking.deliveredDate)}
                </div>
                {tracking.activities?.length > 0 && (
                  <ol className="mt-3 space-y-1.5 text-[11px]">
                    {tracking.activities.slice(0, 6).map((a: any, i: number) => (
                      <li key={i} className="flex gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F46E5]" />
                        <div>
                          <div className="font-medium">{a.activity ?? a["sr-status-label"] ?? a.status ?? ""}</div>
                          <div className="text-[#6B7280]">
                            {a.date ?? a["sr-status-date"] ?? ""}
                            {(a.location ?? a["sr-status-location"]) ? ` · ${a.location ?? a["sr-status-location"]}` : ""}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )}
          </div>

          {/* Right: Customer + Address + Actions */}
          <div className="space-y-4">
            <section className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Customer</div>
              <div className="mt-1 text-[13px] font-semibold">{order.account?.loginId ?? "—"}</div>
            </section>

            {order.shippingAddress && (
              <section className="rounded-lg border border-[#E5E7EB] p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Shipping Address</div>
                <div className="mt-1 text-[12px] leading-relaxed text-[#111827]">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
                  {order.shippingAddress.phone}
                </div>
              </section>
            )}

            <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">Payment</div>
              {row("Status", 
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (PAYMENT_COLOR[order.paymentStatus || ""] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                  {order.paymentStatus}
                </span>
              )}
              {row("Method", order.paymentMethod || "Online")}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}