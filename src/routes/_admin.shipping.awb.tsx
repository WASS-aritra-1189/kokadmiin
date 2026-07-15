import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Copy, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";

export const Route = createFileRoute("/_admin/shipping/awb")({ component: AwbPage });

function AwbPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.orders);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchOrders({ limit: 100 })); }, []);

  const withAwb = items.filter((o) => o.awb);
  const filtered = withAwb.filter((o) =>
    !q ||
    o.orderNumber.toLowerCase().includes(q.toLowerCase()) ||
    o.awb!.toLowerCase().includes(q.toLowerCase()) ||
    o.courierName?.toLowerCase().includes(q.toLowerCase())
  );

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <h1 className="text-[22px] font-semibold tracking-tight">AWB Numbers</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">All assigned Air Waybill numbers from Shiprocket.</p>

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
                <th className="px-3 py-2 text-left">AWB Number</th>
                <th className="px-3 py-2 text-left">Courier</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Destination</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">No AWB numbers found.</td></tr>}
              {!loading && filtered.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#4F46E5]">{o.orderNumber}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-semibold">{o.awb}</span>
                      <button
                        onClick={() => copy(o.awb!)}
                        className="rounded p-0.5 text-[#9CA3AF] hover:text-[#374151]"
                        title="Copy AWB"
                      >
                        {copied === o.awb ? <Check className="h-3 w-3 text-[#16A34A]" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#4B5563]">{o.courierName ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{o.account?.loginId ?? "—"}</div>
                    <div className="text-[10px] text-[#6B7280]">{o.shippingAddress?.fullName ?? ""}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[#4B5563]">
                    {o.shippingAddress ? `${o.shippingAddress.city}, ${o.shippingAddress.state} ${o.shippingAddress.pincode}` : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                      {o.shipmentStatus ?? "NEW"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {o.trackingUrl ? (
                      <a href={o.trackingUrl} target="_blank" rel="noreferrer"
                        className="text-[11px] font-medium text-[#4F46E5] hover:underline">
                        Track →
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <span className="font-medium text-[#111827]">{filtered.length}</span> AWB numbers
        </div>
      </div>
    </div>
  );
}
