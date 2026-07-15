import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ExternalLink, Printer, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { shippingService } from "@/services/shipping.service";
import { ordersService, type Order } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/shipping/shipments")({ component: ShipmentsPage });

const LIMIT = 20;

const SHIPMENT_STATUS_STAGES = [
  "NEW", "PICKUP SCHEDULED", "PICKED UP", "IN TRANSIT", "OUT FOR DELIVERY", "DELIVERED", "CANCELLED",
];

function ShipmentBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[#9CA3AF]">—</span>;
  const s = status.toUpperCase();
  const color =
    s.includes("DELIVERED") ? "bg-[#DCFCE7] text-[#166534]" :
    s.includes("OUT FOR DELIVERY") ? "bg-[#FEF9C3] text-[#854D0E]" :
    s.includes("IN TRANSIT") || s.includes("TRANSIT") ? "bg-[#DBEAFE] text-[#1E40AF]" :
    s.includes("PICKED") ? "bg-[#E0E7FF] text-[#3730A3]" :
    s.includes("SCHEDULED") ? "bg-[#F0F9FF] text-[#0369A1]" :
    s.includes("CANCEL") || s.includes("RTO") ? "bg-[#FEE2E2] text-[#991B1B]" :
    "bg-[#F3F4F6] text-[#4B5563]";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>{status}</span>;
}

function ShipmentsPage() {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.orders);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [labelLoading, setLabelLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const load = (p = page, search = q) => {
    dispatch(fetchOrders({ page: p, limit: LIMIT, ...(search ? { search } : {}) }));
  };

  useEffect(() => { load(); }, [page]);

  const withShipment = items.filter((o) => o.shipmentId);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const stats = {
    total: withShipment.length,
    inTransit: withShipment.filter((o) => o.shipmentStatus?.toUpperCase().includes("TRANSIT")).length,
    outForDelivery: withShipment.filter((o) => o.shipmentStatus?.toUpperCase().includes("OUT FOR DELIVERY")).length,
    delivered: withShipment.filter((o) => o.shipmentStatus?.toUpperCase().includes("DELIVERED")).length,
    cancelled: withShipment.filter((o) => o.shipmentStatus?.toUpperCase().includes("CANCEL") || o.shipmentStatus?.toUpperCase().includes("RTO")).length,
  };

  const handleLabel = async (o: Order) => {
    setLabelLoading(o.id);
    try {
      const res = await ordersService.getLabel(o.id);
      const url = res.data?.labelUrl ?? res.labelUrl;
      if (url) window.open(url, "_blank");
      else setMsg({ id: o.id, text: "Label not available yet.", ok: false });
    } catch (err: any) {
      setMsg({ id: o.id, text: err.response?.data?.message ?? "Failed to get label.", ok: false });
    } finally { setLabelLoading(null); }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Shipments</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">All orders with active Shiprocket shipments.</p>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-[#111827]" },
          { label: "In Transit", value: stats.inTransit, color: "text-[#1E40AF]" },
          { label: "Out for Delivery", value: stats.outForDelivery, color: "text-[#854D0E]" },
          { label: "Delivered", value: stats.delivered, color: "text-[#166534]" },
          { label: "Cancelled / RTO", value: stats.cancelled, color: "text-[#991B1B]" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] text-[#6B7280]">{c.label}</div>
            <div className={`mt-1 text-[20px] font-semibold tabular-nums ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search order number…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <button onClick={() => load()} className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F9FAFB]">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Order #</th>
                <th className="px-3 py-2 text-left">Shipment ID</th>
                <th className="px-3 py-2 text-left">AWB</th>
                <th className="px-3 py-2 text-left">Courier</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Shipment Status</th>
                <th className="px-3 py-2 text-left">Order Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && withShipment.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B7280]">No shipments found.</td></tr>}
              {!loading && withShipment.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{o.shipmentId}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium">{o.awb ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[#4B5563]">{o.courierName ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.city ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5"><ShipmentBadge status={o.shipmentStatus} /></td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]">
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleLabel(o)}
                        disabled={labelLoading === o.id}
                        title="Print label"
                        className="flex items-center gap-1 rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] hover:bg-[#F9FAFB] disabled:opacity-50"
                      >
                        {labelLoading === o.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />}
                        Label
                      </button>
                      {o.trackingUrl && (
                        <a href={o.trackingUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] hover:bg-[#F9FAFB]">
                          <ExternalLink className="h-3 w-3" /> Track
                        </a>
                      )}
                    </div>
                    {msg?.id === o.id && (
                      <div className="mt-1 text-[10px] text-[#B91C1C]">{msg.text}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div>Showing <span className="font-medium text-[#111827]">{withShipment.length}</span> of {total}</div>
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
