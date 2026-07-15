import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ordersSlice";
import { ordersService, type Order } from "@/services/orders.service";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/shipping/tracking")({ component: LiveTrackingPage });

function LiveTrackingPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.orders);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchOrders({ limit: 100 })); }, []);

  const withAwb = items.filter((o) => o.awb);
  const filtered = withAwb.filter((o) =>
    !q ||
    o.orderNumber.toLowerCase().includes(q.toLowerCase()) ||
    o.awb!.toLowerCase().includes(q.toLowerCase())
  );

  const handleTrack = async (o: Order) => {
    setSelected(o);
    setTracking(null);
    setTrackError(null);
    setTrackLoading(true);
    try {
      const res = await ordersService.track(o.id);
      setTracking(res.data ?? res);
    } catch (err: any) {
      setTrackError(err.response?.data?.message ?? "Failed to fetch tracking.");
    } finally { setTrackLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <h1 className="text-[22px] font-semibold tracking-tight">Live Tracking</h1>
      <p className="mt-1 text-[13px] text-[#6B7280]">Real-time shipment tracking via Shiprocket.</p>

      <div className="mt-5 grid grid-cols-5 gap-4">
        {/* Left: order list */}
        <div className="col-span-2 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#F3F4F6] px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search order or AWB…"
                className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>
          <div className="divide-y divide-[#F3F4F6] overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {loading && <div className="px-4 py-6 text-center text-[12px] text-[#6B7280]">Loading…</div>}
            {!loading && filtered.length === 0 && <div className="px-4 py-6 text-center text-[12px] text-[#6B7280]">No shipments with AWB.</div>}
            {!loading && filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => handleTrack(o)}
                className={`w-full px-4 py-3 text-left hover:bg-[#FAFAF9] ${selected?.id === o.id ? "bg-[#EEF2FF]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-[#4F46E5]">{o.orderNumber}</span>
                  <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                    {o.shipmentStatus ?? "NEW"}
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-[#6B7280]">{o.awb}</div>
                <div className="mt-0.5 text-[11px] text-[#4B5563]">{o.courierName ?? ""}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: tracking detail */}
        <div className="col-span-3 rounded-lg border border-[#E5E7EB] bg-white">
          {!selected && (
            <div className="flex h-full items-center justify-center text-[13px] text-[#9CA3AF]">
              Select an order to view live tracking
            </div>
          )}
          {selected && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-mono text-[14px] font-semibold text-[#4F46E5]">{selected.orderNumber}</div>
                  <div className="text-[11px] text-[#6B7280]">AWB: {selected.awb} · {selected.courierName}</div>
                </div>
                <button
                  onClick={() => handleTrack(selected)}
                  disabled={trackLoading}
                  className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F9FAFB] disabled:opacity-60"
                >
                  <RefreshCw className={`h-3 w-3 ${trackLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {trackLoading && (
                <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Fetching live tracking…
                </div>
              )}

              {trackError && (
                <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">
                  {trackError}
                </div>
              )}

              {!trackLoading && tracking && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Current Status", value: tracking.status },
                      { label: "Description", value: tracking.currentStatus },
                      { label: "ETD", value: tracking.etd },
                      { label: "Delivered", value: tracking.deliveredDate },
                    ].filter((r) => r.value).map((r) => (
                      <div key={r.label} className="rounded-lg border border-[#F3F4F6] p-3">
                        <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">{r.label}</div>
                        <div className="mt-1 text-[12px] font-medium">{r.value}</div>
                      </div>
                    ))}
                  </div>

                  {tracking.activities?.length > 0 && (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Activity Timeline</div>
                      <ol className="space-y-2">
                        {tracking.activities.map((a: any, i: number) => (
                          <li key={i} className="flex gap-3">
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#4F46E5]" />
                            <div className="text-[12px]">
                              <div className="font-medium">{a.activity ?? a["sr-status-label"] ?? a.status ?? ""}</div>
                              <div className="text-[11px] text-[#6B7280]">
                                {a.date ?? a["sr-status-date"] ?? ""}
                                {(a.location ?? a["sr-status-location"]) ? ` · ${a.location ?? a["sr-status-location"]}` : ""}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
