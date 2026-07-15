import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer, RefreshCw, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { ordersService, type Order } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/shipping/labels")({ component: LabelsPage });

function LabelsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.orders);
  const [q, setQ] = useState("");
  const [labelLoading, setLabelLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  useEffect(() => { dispatch(fetchOrders({ limit: 100 })); }, []);

  const withShipment = items.filter((o) => o.shipmentId);
  const filtered = withShipment.filter((o) =>
    !q ||
    o.orderNumber.toLowerCase().includes(q.toLowerCase()) ||
    o.awb?.toLowerCase().includes(q.toLowerCase()) ||
    o.courierName?.toLowerCase().includes(q.toLowerCase())
  );

  const handleLabel = async (o: Order) => {
    setLabelLoading(o.id);
    setMsg(null);
    try {
      const res = await ordersService.getLabel(o.id);
      const url = res.data?.labelUrl ?? res.labelUrl;
      if (url) window.open(url, "_blank");
      else setMsg({ id: o.id, text: "Label not ready yet.", ok: false });
    } catch (err: any) {
      setMsg({ id: o.id, text: err.response?.data?.message ?? "Failed to get label.", ok: false });
    } finally { setLabelLoading(null); }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Labels</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">Generate and print Shiprocket shipping labels.</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order, AWB or courier…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Order #</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">AWB</th>
                <th className="px-3 py-2 text-left">Courier</th>
                <th className="px-3 py-2 text-left">Shipment Status</th>
                <th className="px-3 py-2 text-right">Label</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">No shipments found.</td></tr>}
              {!loading && filtered.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.fullName ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium">{o.awb ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[#4B5563]">{o.courierName ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                      {o.shipmentStatus ?? "NEW"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => handleLabel(o)}
                      disabled={labelLoading === o.id}
                      className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F9FAFB] disabled:opacity-50 ml-auto"
                    >
                      {labelLoading === o.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />}
                      {labelLoading === o.id ? "Loading…" : "Print Label"}
                    </button>
                    {msg?.id === o.id && (
                      <div className={`mt-1 text-[10px] ${msg.ok ? "text-[#166534]" : "text-[#B91C1C]"}`}>{msg.text}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          Showing <span className="font-medium text-[#111827]">{filtered.length}</span> shipments
        </div>
      </div>
    </div>
  );
}
