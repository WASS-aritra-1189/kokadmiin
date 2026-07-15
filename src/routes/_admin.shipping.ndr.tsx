import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";

export const Route = createFileRoute("/_admin/shipping/ndr")({ component: NdrPage });

const NDR_KEYWORDS = ["NDR", "FAILED DELIVERY", "DELIVERY FAILED", "UNDELIVERED", "DELIVERY ATTEMPT"];

function NdrPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrders({ limit: 100 })); }, []);

  const ndrOrders = items.filter((o) =>
    o.shipmentStatus && NDR_KEYWORDS.some((k) => o.shipmentStatus!.toUpperCase().includes(k))
  );

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <h1 className="text-[22px] font-semibold tracking-tight">NDR — Non-Delivery Reports</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">Orders where delivery was attempted but failed.</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {loading && <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">Loading…</div>}
        {!loading && ndrOrders.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-[#D1D5DB]" />
            <div className="text-[13px] font-medium text-[#374151]">No NDR orders</div>
            <div className="text-[12px] text-[#6B7280]">All deliveries are on track.</div>
          </div>
        )}
        {!loading && ndrOrders.length > 0 && (
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Order #</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">AWB</th>
                <th className="px-3 py-2 text-left">Courier</th>
                <th className="px-3 py-2 text-left">NDR Status</th>
                <th className="px-3 py-2 text-left">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {ndrOrders.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.fullName ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px]">{o.awb ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[#4B5563]">{o.courierName ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[10px] font-medium text-[#854D0E]">
                      {o.shipmentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {o.trackingUrl ? (
                      <a href={o.trackingUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-medium text-[#4F46E5] hover:underline">
                        <ExternalLink className="h-3 w-3" /> Track
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
