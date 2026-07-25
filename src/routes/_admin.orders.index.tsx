import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, X, ExternalLink, RefreshCw, Truck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders, updateOrderStatus } from "@/store/slices/ordersSlice";
import { ordersService, type Order, type OrderStatus } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/orders/")({ component: OrdersPage });

const LIMIT = 10;

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:    "bg-[#FEF9C3] text-[#854D0E]",
  CONFIRMED:  "bg-[#DBEAFE] text-[#1E40AF]",
  PROCESSING: "bg-[#E0E7FF] text-[#3730A3]",
  SHIPPED:    "bg-[#CFFAFE] text-[#155E75]",
  DELIVERED:  "bg-[#DCFCE7] text-[#166534]",
  CANCELLED:  "bg-[#F3F4F6] text-[#4B5563]",
  REFUNDED:   "bg-[#EDE9FE] text-[#5B21B6]",
};

const PAYMENT_COLOR: Record<string, string> = {
  SUCCESS:          "bg-[#DCFCE7] text-[#166534]",
  PENDING:          "bg-[#FEF9C3] text-[#854D0E]",
  FAILED:           "bg-[#FEE2E2] text-[#991B1B]",
  CANCELLED:        "bg-[#F3F4F6] text-[#4B5563]",
  REFUNDED:         "bg-[#EDE9FE] text-[#5B21B6]",
  REFUND_PROCESSING:"bg-[#EDE9FE] text-[#5B21B6]",
};

function ShipmentBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[#9CA3AF]">—</span>;
  return (
    <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status as OrderStatus] ?? "bg-[#F3F4F6] text-[#4B5563]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const color = PAYMENT_COLOR[status] ?? "bg-[#F3F4F6] text-[#4B5563]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function OrdersPage() {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.orders);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"All" | OrderStatus>("All");
  const [selected, setSelected] = useState<Order | null>(null);

  const load = (p = page, search = q, status = tab) => {
    dispatch(fetchOrders({
      page: p,
      limit: LIMIT,
      ...(search ? { search } : {}),
      ...(status !== "All" ? { status } : {}),
    }));
  };

  useEffect(() => { load(); }, [page, tab]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const tabCounts: Record<string, number> = { All: total };
  ORDER_STATUSES.forEach((s) => {
    tabCounts[s] = items.filter((o) => o.status === s).length;
  });

  const handleSelect = async (order: Order) => {
    try {
      const res = await ordersService.getById(order.id);
      setSelected(res ?? order);
    } catch {
      setSelected(order);
    }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Orders</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">All Orders</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Manage fulfilment, cancellations, refunds and returns.</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-2">
          {(["All", ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setTab(s); setPage(1); }}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[12px] font-medium ${tab === s ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
            >
              {s}
              <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">
                {tabCounts[s] ?? 0}
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
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q, tab); } }}
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
                <th className="px-3 py-2 text-right">Items</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-left">Payment</th>
                <th className="px-3 py-2 text-left">AWB</th>
                <th className="px-3 py-2 text-left">Shipment</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-[#6B7280]">No orders found.</td></tr>}
              {!loading && items.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5 text-[#4B5563] tabular-nums">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.fullName ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{o.items?.length ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">₹{Number(o.totalAmount).toFixed(2)}</td>
                  <td className="px-3 py-2.5"><PaymentBadge status={o.paymentStatus} /></td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{o.awb ?? "—"}</td>
                  <td className="px-3 py-2.5"><ShipmentBadge status={o.shipmentStatus} /></td>
                  <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => handleSelect(o)}
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
          <div>Showing <span className="font-medium text-[#111827]">{items.length}</span> of {total}</div>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`rounded-md px-2 py-1 ${p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]"}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(updated) => {
            setSelected(updated);
            load();
          }}
        />
      )}
    </div>
  );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

function OrderDrawer({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (updated: Order) => void;
}) {
  const dispatch = useAppDispatch();
  const { saving } = useAppSelector((s) => s.orders);
  const [pickupDate, setPickupDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [tracking, setTracking] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmingCOD, setConfirmingCOD] = useState(false);

  const isCODPending = order.paymentMethod === "COD" && order.paymentStatus === "PENDING";

  const handleConfirmCOD = async () => {
    if (!confirm("Confirm that payment has been received for this COD order?")) return;
    setConfirmingCOD(true);
    setMsg(null);
    try {
      const res = await ordersService.confirmCODPayment(order.id);
      setMsg({ text: "COD payment confirmed successfully!", ok: true });
      onStatusChange(res);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message ?? "Failed to confirm COD payment.", ok: false });
    } finally { setConfirmingCOD(false); }
  };

  useEffect(() => {
    if (order.awb) void handleTrack();
  }, [order.id]);

  const handleStatusChange = async (status: OrderStatus) => {
    const res = await dispatch(updateOrderStatus({ id: order.id, status }));
    if (updateOrderStatus.fulfilled.match(res)) {
      onStatusChange(res.payload as Order);
      setMsg({ text: `Status updated to ${status}`, ok: true });
    } else {
      setMsg({ text: res.payload as string, ok: false });
    }
  };

  const handlePickup = async () => {
    if (!pickupDate) return;
    setScheduling(true);
    setMsg(null);
    try {
      const formattedDate = pickupDate.replace("T", " ");
      await ordersService.schedulePickup(order.id, formattedDate);
      setMsg({ text: "Pickup scheduled successfully.", ok: true });
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message ?? "Failed to schedule pickup.", ok: false });
    } finally { setScheduling(false); }
  };

  const handleTrack = async () => {
    setTrackLoading(true);
    setMsg(null);
    try {
      const res = await ordersService.track(order.id);
      setTracking(res);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message ?? "Failed to fetch tracking.", ok: false });
    } finally { setTrackLoading(false); }
  };

  const sub = order.items?.reduce((s, i) => s + Number(i.price) * i.quantity, 0) ?? Number(order.subtotal);

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
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-0.5 text-[11px] text-[#6B7280]">
              {new Date(order.createdAt).toLocaleString("en-IN")} · <PaymentBadge status={order.paymentStatus} />
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-5 py-2.5">
          {/* Status change dropdown */}
          <select
            disabled={saving}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
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
          {/* Left: items + totals + shipment */}
          <div className="col-span-2 space-y-4">
            {/* Line items */}
            <section className="rounded-lg border border-[#E5E7EB]">
              <div className="border-b border-[#F3F4F6] px-4 py-2.5 text-[12px] font-semibold">Line Items</div>
              {order.items?.length ? (
                <table className="w-full text-[12px]">
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t border-[#F3F4F6]">
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{item.bookTitle ?? item.bookId}</div>
                          <div className="font-mono text-[10px] text-[#6B7280]">{item.bookId}</div>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-[#4B5563]">
                          {item.quantity} × ₹{Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                          ₹{Number(item.total).toFixed(2)}
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
                  <TotalRow label="Subtotal" value={`₹${Number(order.subtotal ?? sub).toFixed(2)}`} />
                  {Number(order.discount) > 0 && <TotalRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`-₹${Number(order.discount).toFixed(2)}`} />}
                  {Number(order.tax) > 0 && <TotalRow label="Tax" value={`₹${Number(order.tax).toFixed(2)}`} />}
                  <TotalRow label="Shipping" value={`₹${Number(order.shippingCharge).toFixed(2)}`} />
                  <div className="mt-2 border-t border-[#F3F4F6] pt-2">
                    <TotalRow label="Total" value={`₹${Number(order.totalAmount).toFixed(2)}`} bold />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipment */}
            <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Shipment</div>
              {row("Shipment ID", order.shipmentId)}
              {row("AWB", order.awb ? <span className="font-mono text-[#4F46E5]">{order.awb}</span> : null)}
              {row("Courier", order.courierName)}
              {row("Shipment Status", <ShipmentBadge status={order.shipmentStatus} />)}
              {order.trackingUrl && row("Tracking URL",
                <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#4F46E5] hover:underline">
                  <ExternalLink className="h-3 w-3" /> Open
                </a>
              )}
            </section>

            {/* Schedule pickup */}
            {isCODPending && (
              <section className="rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#92400E] mb-3">
                  <Truck className="inline h-3 w-3 mr-1" />COD Payment Pending
                </div>
                <p className="text-[12px] text-[#92400E] mb-3">
                  This is a Cash on Delivery order. Confirm when payment has been received from the customer.
                </p>
                <button
                  onClick={handleConfirmCOD}
                  disabled={confirmingCOD}
                  className="h-8 rounded-md bg-[#F59E0B] px-3 text-[12px] font-medium text-white hover:bg-[#D97706] disabled:opacity-60"
                >
                  {confirmingCOD ? "Confirming…" : "Confirm Payment Received"}
                </button>
              </section>
            )}

            {order.paymentStatus === "SUCCESS" && order.shipmentId && !["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status) && (
              <section className="rounded-lg border border-[#E5E7EB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
                  <Truck className="inline h-3 w-3 mr-1" />Schedule Pickup
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
                  {tracking.status && row("Current Status", <ShipmentBadge status={tracking.status} />)}
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

          {/* Right: customer + address */}
          <div className="space-y-4">
            <section className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Customer</div>
              <div className="mt-1 text-[13px] font-semibold">{order.account?.loginId ?? "—"}</div>
            </section>

            <section className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Shipping Address</div>
              {order.shippingAddress ? (
                <div className="mt-1 text-[12px] leading-relaxed text-[#111827]">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
                  {order.shippingAddress.phone}
                </div>
              ) : (
                <div className="mt-1 text-[12px] text-[#6B7280]">—</div>
              )}
            </section>

            <section className="rounded-lg border border-[#E5E7EB] p-4 space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">Payment</div>
              {row("Status", <PaymentBadge status={order.paymentStatus} />)}
              {row("Paid", `₹${Number(order.paidAmount).toFixed(2)}`)}
              {row("Transaction ID", order.transactionId)}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-[14px] font-semibold" : "text-[#4B5563]"}`}>
      <span>{label}</span>
      <span className="tabular-nums text-[#111827]">{value}</span>
    </div>
  );
}
