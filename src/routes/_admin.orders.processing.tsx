import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Truck, ExternalLink, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { ordersService, type Order } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/orders/processing")({ component: ProcessingPage });

const LIMIT = 20;

const SHIPMENT_STAGES = ["NEW", "PICKUP SCHEDULED", "PICKED UP", "OUT FOR PICKUP", "IN TRANSIT", "OUT FOR DELIVERY"];

function ShipmentBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[#9CA3AF]">—</span>;
  return (
    <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
      {status}
    </span>
  );
}

function ProcessingPage() {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.orders);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [pickupDate, setPickupDate] = useState<Record<string, string>>({});
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [labelLoading, setLabelLoading] = useState<string | null>(null);

  const load = (p = page, search = q) => {
    dispatch(fetchOrders({ page: p, limit: LIMIT, status: "PROCESSING", ...(search ? { search } : {}) }));
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handlePickup = async (order: Order) => {
    const date = pickupDate[order.id];
    if (!date) return;
    setScheduling(order.id);
    setMsg(null);
    try {
      await ordersService.schedulePickup(order.id, date);
      setMsg({ id: order.id, text: "Pickup scheduled successfully.", ok: true });
      load();
    } catch (err: any) {
      setMsg({ id: order.id, text: err.response?.data?.message ?? "Failed to schedule pickup.", ok: false });
    } finally {
      setScheduling(null);
    }
  };

  const handleLabel = async (order: Order) => {
    setLabelLoading(order.id);
    try {
      const res = await ordersService.getLabel(order.id);
      const url = res.data?.labelUrl ?? res.labelUrl;
      if (url) window.open(url, "_blank");
    } catch (err: any) {
      setMsg({ id: order.id, text: err.response?.data?.message ?? "Failed to get label.", ok: false });
    } finally {
      setLabelLoading(null);
    }
  };

  // Stats
  const withShipment = items.filter((o) => o.shipmentId).length;
  const pendingPickup = items.filter((o) => !o.awb).length;

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Orders</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Processing</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">Orders confirmed and awaiting pickup or dispatch.</p>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total Processing", value: total, color: "text-[#111827]" },
          { label: "Shipment Created", value: withShipment, color: "text-[#1D4ED8]" },
          { label: "Awaiting AWB", value: pendingPickup, color: "text-[#D97706]" },
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
                <th className="px-3 py-2 text-right">Items</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-left">AWB</th>
                <th className="px-3 py-2 text-left">Shipment Status</th>
                <th className="px-3 py-2 text-left">Schedule Pickup</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6B7280]">No orders in processing.</td></tr>
              )}
              {!loading && items.map((o: Order) => (
                <>
                  <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                    <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                    <td className="px-3 py-2.5 text-[#4B5563] tabular-nums">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                      <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.fullName ?? ""}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{o.items?.length ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">₹{Number(o.totalAmount).toFixed(2)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{o.awb ?? "—"}</td>
                    <td className="px-3 py-2.5"><ShipmentBadge status={o.shipmentStatus} /></td>
                    <td className="px-3 py-2.5">
                      {o.shipmentId ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="datetime-local"
                            value={pickupDate[o.id] ? pickupDate[o.id].replace(" ", "T") : ""}
                            onChange={(e) => setPickupDate((p) => ({ ...p, [o.id]: e.target.value.replace("T", " ").slice(0, 16) }))}
                            className="h-7 rounded-md border border-[#E5E7EB] bg-white px-1.5 text-[11px] outline-none focus:border-[#4F46E5]"
                          />
                          <button
                            disabled={scheduling === o.id || !pickupDate[o.id]}
                            onClick={() => handlePickup(o)}
                            className="flex items-center gap-1 rounded-md bg-[#111827] px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                          >
                            <Truck className="h-3 w-3" />
                            {scheduling === o.id ? "…" : "Schedule"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9CA3AF]">No shipment</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {o.shipmentId && (
                          <button
                            disabled={labelLoading === o.id}
                            onClick={() => handleLabel(o)}
                            title="Get shipping label"
                            className="rounded-md border border-[#E5E7EB] p-1 text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
                          >
                            {labelLoading === o.id
                              ? <RefreshCw className="h-3 w-3 animate-spin" />
                              : <ExternalLink className="h-3 w-3" />}
                          </button>
                        )}
                        {o.trackingUrl && (
                          <a
                            href={o.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Track shipment"
                            className="rounded-md border border-[#E5E7EB] p-1 text-[#374151] hover:bg-[#F9FAFB]"
                          >
                            <Truck className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Inline feedback */}
                  {msg?.id === o.id && (
                    <tr key={o.id + "-msg"}>
                      <td colSpan={9} className="px-3 pb-2">
                        <div className={`rounded-md border px-3 py-1.5 text-[11px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>
                          {msg.text}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
