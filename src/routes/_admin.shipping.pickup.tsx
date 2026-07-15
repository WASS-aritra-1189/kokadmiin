import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { ordersService, type Order } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/shipping/pickup")({ component: PickupPage });

function PickupPage() {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((s) => s.orders);
  const [pickupDate, setPickupDate] = useState<Record<string, string>>({});
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  useEffect(() => {
    dispatch(fetchOrders({ status: "PROCESSING", limit: 100 }));
  }, []);

  const ordersWithShipment = items.filter((o) => o.shipmentId);

  // Shiprocket statuses that mean pickup has already been generated/scheduled or beyond
  const PICKUP_DONE_KEYWORDS = [
    "PICKUP GENERATED", "PICKUP SCHEDULED", "PICKUP REQUESTED",
    "PICKED UP", "PICKED_UP", "OUT FOR PICKUP",
    "IN TRANSIT", "IN_TRANSIT", "OUT FOR DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED",
  ];

  const pickupGenerated = ordersWithShipment.filter((o) => {
    const s = o.shipmentStatus?.toUpperCase() ?? "";
    return PICKUP_DONE_KEYWORDS.some((kw) => s.includes(kw));
  });
  const pendingPickup = ordersWithShipment.filter((o) => !pickupGenerated.includes(o));

  const handleSchedule = async (o: Order) => {
    const date = pickupDate[o.id];
    if (!date) return;
    setScheduling(o.id);
    setMsg(null);
    try {
      await ordersService.schedulePickup(o.id, date);
      setMsg({ id: o.id, text: "Pickup scheduled successfully.", ok: true });
      dispatch(fetchOrders({ status: "PROCESSING", limit: 100 }));
    } catch (err: any) {
      setMsg({ id: o.id, text: err.response?.data?.message ?? "Failed to schedule pickup.", ok: false });
    } finally { setScheduling(null); }
  };

  const Section = ({ title, orders, showAction }: { title: string; orders: Order[]; showAction: boolean }) => (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#F3F4F6] px-4 py-2.5 text-[12px] font-semibold">{title} <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] text-[#4B5563]">{orders.length}</span></div>
      {orders.length === 0 ? (
        <div className="px-4 py-6 text-center text-[12px] text-[#6B7280]">None.</div>
      ) : (
        <table className="w-full text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
            <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
              <th className="px-3 py-2 text-left">Order #</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Shipment ID</th>
              <th className="px-3 py-2 text-left">AWB</th>
              <th className="px-3 py-2 text-left">Shipment Status</th>
              {showAction && <th className="px-3 py-2 text-left">Schedule Pickup</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <>
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.city ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B7280]">{o.shipmentId}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px]">{o.awb ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                      {o.shipmentStatus ?? "NEW"}
                    </span>
                  </td>
                  {showAction && (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="datetime-local"
                          value={pickupDate[o.id] ? pickupDate[o.id].replace(" ", "T") : ""}
                          onChange={(e) => setPickupDate((p) => ({ ...p, [o.id]: e.target.value.replace("T", " ").slice(0, 16) }))}
                          className="h-7 rounded-md border border-[#E5E7EB] bg-white px-1.5 text-[11px] outline-none focus:border-[#4F46E5]"
                        />
                        <button
                          disabled={scheduling === o.id || !pickupDate[o.id]}
                          onClick={() => handleSchedule(o)}
                          className="flex items-center gap-1 rounded-md bg-[#111827] px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                        >
                          <Truck className="h-3 w-3" />
                          {scheduling === o.id ? "…" : "Schedule"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
                {msg?.id === o.id && (
                  <tr key={o.id + "-msg"}>
                    <td colSpan={showAction ? 6 : 5} className="px-3 pb-2">
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
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Pickup Requests</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">Schedule and manage Shiprocket pickup requests.</p>

      {loading ? (
        <div className="mt-8 text-center text-[12px] text-[#6B7280]">Loading…</div>
      ) : (
        <div className="mt-5 space-y-4">
          <Section title="Awaiting Pickup Schedule" orders={pendingPickup} showAction={true} />
          <Section title="Pickup Generated" orders={pickupGenerated} showAction={false} />
        </div>
      )}
    </div>
  );
}
