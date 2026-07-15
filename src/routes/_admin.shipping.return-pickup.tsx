import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PackageCheck, Truck, ExternalLink, RefreshCw, ArrowRightLeft } from "lucide-react";
import { ordersService, type ReturnRequest, type ExchangeRequest } from "@/services/orders.service";

export const Route = createFileRoute("/_admin/shipping/return-pickup")({ component: ReturnPickupPage });

type Tab = "returns" | "exchanges";

function ShipmentInfo({ shipmentId, awb, pickupStatus, pickupScheduledAt }: {
  shipmentId: string | null;
  awb: string | null;
  pickupStatus: string | null;
  pickupScheduledAt: string | null;
}) {
  if (!shipmentId) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
      <span className="text-[#6B7280]">Shipment ID: <span className="font-mono text-[#374151]">{shipmentId}</span></span>
      {awb && <span className="text-[#6B7280]">AWB: <span className="font-mono font-medium text-[#4F46E5]">{awb}</span></span>}
      {pickupStatus && (
        <span className="rounded-full bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
          {pickupStatus}
        </span>
      )}
      {pickupScheduledAt && <span className="text-[#6B7280]">Scheduled: {new Date(pickupScheduledAt).toLocaleString("en-IN")}</span>}
      {awb && (
        <a href={`https://shiprocket.co/tracking/${awb}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[#4F46E5] hover:underline">
          <ExternalLink className="h-3 w-3" /> Track
        </a>
      )}
    </div>
  );
}

function ReturnPickupPage() {
  const [tab, setTab] = useState<Tab>("returns");
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const [r, e] = await Promise.all([
        ordersService.getAllReturns("APPROVED"),
        ordersService.getAllExchanges("APPROVED"),
      ]);
      setReturns(Array.isArray(r) ? r : []);
      setExchanges(Array.isArray(e) ? e : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReturnPickup = async (r: ReturnRequest) => {
    setBusy(r.id + "pickup");
    setMsg(null);
    try {
      await ordersService.scheduleReturnPickup(r.orderId);
      setMsg({ id: r.id, text: "Return pickup scheduled successfully.", ok: true });
      load();
    } catch (err: any) {
      setMsg({ id: r.id, text: err.response?.data?.message ?? "Failed to schedule pickup.", ok: false });
    } finally { setBusy(null); }
  };

  const handleReturnComplete = async (r: ReturnRequest) => {
    setBusy(r.id + "complete");
    setMsg(null);
    try {
      await ordersService.completeReturn(r.orderId);
      setMsg({ id: r.id, text: "Return completed — stock restored and refund initiated.", ok: true });
      load();
    } catch (err: any) {
      setMsg({ id: r.id, text: err.response?.data?.message ?? "Failed to complete return.", ok: false });
    } finally { setBusy(null); }
  };

  const handleExchangePickup = async (e: ExchangeRequest) => {
    setBusy(e.id + "pickup");
    setMsg(null);
    try {
      await ordersService.scheduleExchangePickup(e.orderId);
      setMsg({ id: e.id, text: "Exchange pickup scheduled successfully.", ok: true });
      load();
    } catch (err: any) {
      setMsg({ id: e.id, text: err.response?.data?.message ?? "Failed to schedule pickup.", ok: false });
    } finally { setBusy(null); }
  };

  const handleExchangeComplete = async (e: ExchangeRequest) => {
    setBusy(e.id + "complete");
    setMsg(null);
    try {
      await ordersService.completeExchange(e.orderId);
      setMsg({ id: e.id, text: "Exchange completed — new books dispatched via Shiprocket.", ok: true });
      load();
    } catch (err: any) {
      setMsg({ id: e.id, text: err.response?.data?.message ?? "Failed to complete exchange.", ok: false });
    } finally { setBusy(null); }
  };

  const pendingReturns = returns.filter((r) => !r.returnShipmentId);
  const scheduledReturns = returns.filter((r) => r.returnShipmentId);
  const pendingExchanges = exchanges.filter((e) => !e.returnShipmentId);
  const scheduledExchanges = exchanges.filter((e) => e.returnShipmentId);

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Shipping</div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Return & Exchange Pickup</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Schedule Shiprocket reverse pickups for approved returns and exchanges.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F9FAFB]">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 border-b border-[#E5E7EB]">
        <button
          onClick={() => setTab("returns")}
          className={`border-b-2 px-4 py-2.5 text-[12px] font-medium ${tab === "returns" ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
        >
          Returns
          <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">{returns.length}</span>
        </button>
        <button
          onClick={() => setTab("exchanges")}
          className={`border-b-2 px-4 py-2.5 text-[12px] font-medium ${tab === "exchanges" ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
        >
          Exchanges
          <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">{exchanges.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-[12px] text-[#6B7280]">Loading…</div>
      ) : (
        <div className="mt-5 space-y-4">

          {/* ── RETURNS TAB ── */}
          {tab === "returns" && (
            <>
              {/* Awaiting pickup */}
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                <div className="border-b border-[#F3F4F6] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">Awaiting Reverse Pickup</span>
                    <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">{pendingReturns.length}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B7280]">Approved returns — schedule Shiprocket pickup from customer</div>
                </div>
                {pendingReturns.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">None.</div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {pendingReturns.map((r) => (
                      <div key={r.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-semibold text-[#4F46E5]">{r.order?.orderNumber ?? r.orderId.slice(0, 8)}</span>
                              <span className="text-[11px] text-[#6B7280]">Approved {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-IN") : ""}</span>
                            </div>
                            <div className="text-[12px] text-[#374151]">{r.reason ?? "No reason provided"}</div>
                            <div className="space-y-0.5">
                              {r.items.map((item, i) => (
                                <div key={i} className="text-[11px] text-[#6B7280]">{item.bookTitle} × {item.quantity} — ₹{Number(item.price).toFixed(2)}</div>
                              ))}
                            </div>
                          </div>
                          <div className="shrink-0 text-right space-y-2">
                            <div className="text-[13px] font-semibold">₹{Number(r.refundAmount).toFixed(2)}</div>
                            <button
                              disabled={busy === r.id + "pickup"}
                              onClick={() => handleReturnPickup(r)}
                              className="flex items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
                            >
                              <Truck className="h-3.5 w-3.5" />
                              {busy === r.id + "pickup" ? "Scheduling…" : "Schedule Pickup"}
                            </button>
                          </div>
                        </div>
                        {msg?.id === r.id && (
                          <div className={`mt-2 rounded-md border px-3 py-1.5 text-[11px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>{msg.text}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pickup scheduled */}
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                <div className="border-b border-[#F3F4F6] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">Pickup Scheduled — Awaiting Receipt</span>
                    <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">{scheduledReturns.length}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B7280]">Mark received once item arrives at warehouse to trigger refund</div>
                </div>
                {scheduledReturns.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">None.</div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {scheduledReturns.map((r) => (
                      <div key={r.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-semibold text-[#4F46E5]">{r.order?.orderNumber ?? r.orderId.slice(0, 8)}</span>
                              <span className="text-[11px] text-[#6B7280]">Approved {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-IN") : ""}</span>
                            </div>
                            <div className="space-y-0.5">
                              {r.items.map((item, i) => (
                                <div key={i} className="text-[11px] text-[#6B7280]">{item.bookTitle} × {item.quantity}</div>
                              ))}
                            </div>
                            <ShipmentInfo shipmentId={r.returnShipmentId} awb={r.returnAwb} pickupStatus={r.returnPickupStatus} pickupScheduledAt={r.pickupScheduledAt} />
                          </div>
                          <div className="shrink-0 text-right space-y-2">
                            <div className="text-[13px] font-semibold">₹{Number(r.refundAmount).toFixed(2)}</div>
                            <button
                              disabled={busy === r.id + "complete"}
                              onClick={() => handleReturnComplete(r)}
                              className="flex items-center gap-1.5 rounded-md bg-[#16A34A] px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
                            >
                              <PackageCheck className="h-3.5 w-3.5" />
                              {busy === r.id + "complete" ? "Processing…" : "Mark Received & Refund"}
                            </button>
                          </div>
                        </div>
                        {msg?.id === r.id && (
                          <div className={`mt-2 rounded-md border px-3 py-1.5 text-[11px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>{msg.text}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── EXCHANGES TAB ── */}
          {tab === "exchanges" && (
            <>
              {/* Awaiting pickup */}
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                <div className="border-b border-[#F3F4F6] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">Awaiting Reverse Pickup</span>
                    <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">{pendingExchanges.length}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B7280]">Approved exchanges — schedule Shiprocket pickup of old books from customer</div>
                </div>
                {pendingExchanges.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">None.</div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {pendingExchanges.map((e) => (
                      <div key={e.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-semibold text-[#4F46E5]">{e.order?.orderNumber ?? e.orderId.slice(0, 8)}</span>
                              <span className="text-[11px] text-[#6B7280]">Approved {e.approvedAt ? new Date(e.approvedAt).toLocaleDateString("en-IN") : ""}</span>
                            </div>
                            <div className="text-[12px] text-[#374151]">{e.reason ?? "No reason provided"}</div>
                            <div className="space-y-0.5">
                              {e.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                                  <span>{item.bookTitle}</span>
                                  <ArrowRightLeft className="h-3 w-3 shrink-0" />
                                  <span>{item.newBookTitle}</span>
                                  <span>× {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="shrink-0 text-right space-y-2">
                            <div className={`text-[13px] font-semibold ${Number(e.priceDifference) > 0 ? "text-[#DC2626]" : Number(e.priceDifference) < 0 ? "text-[#16A34A]" : ""}`}>
                              {Number(e.priceDifference) !== 0 ? `${Number(e.priceDifference) > 0 ? "+" : ""}₹${Number(e.priceDifference).toFixed(2)}` : "No diff"}
                            </div>
                            <button
                              disabled={busy === e.id + "pickup"}
                              onClick={() => handleExchangePickup(e)}
                              className="flex items-center gap-1.5 rounded-md bg-[#7C3AED] px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
                            >
                              <Truck className="h-3.5 w-3.5" />
                              {busy === e.id + "pickup" ? "Scheduling…" : "Schedule Pickup"}
                            </button>
                          </div>
                        </div>
                        {msg?.id === e.id && (
                          <div className={`mt-2 rounded-md border px-3 py-1.5 text-[11px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>{msg.text}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pickup scheduled — complete exchange */}
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                <div className="border-b border-[#F3F4F6] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">Pickup Scheduled — Complete Exchange</span>
                    <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#4B5563]">{scheduledExchanges.length}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B7280]">Old books picked up — complete to dispatch new books via Shiprocket</div>
                </div>
                {scheduledExchanges.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-[#6B7280]">None.</div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {scheduledExchanges.map((e) => (
                      <div key={e.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-semibold text-[#4F46E5]">{e.order?.orderNumber ?? e.orderId.slice(0, 8)}</span>
                              <span className="text-[11px] text-[#6B7280]">Approved {e.approvedAt ? new Date(e.approvedAt).toLocaleDateString("en-IN") : ""}</span>
                            </div>
                            <div className="space-y-0.5">
                              {e.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                                  <span>{item.bookTitle}</span>
                                  <ArrowRightLeft className="h-3 w-3 shrink-0" />
                                  <span className="font-medium text-[#374151]">{item.newBookTitle}</span>
                                  <span>× {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <ShipmentInfo shipmentId={e.returnShipmentId} awb={e.returnAwb} pickupStatus={e.returnPickupStatus} pickupScheduledAt={e.pickupScheduledAt} />
                          </div>
                          <div className="shrink-0 text-right space-y-2">
                            <div className={`text-[13px] font-semibold ${Number(e.priceDifference) > 0 ? "text-[#DC2626]" : Number(e.priceDifference) < 0 ? "text-[#16A34A]" : ""}`}>
                              {Number(e.priceDifference) !== 0 ? `${Number(e.priceDifference) > 0 ? "+" : ""}₹${Number(e.priceDifference).toFixed(2)}` : "No diff"}
                            </div>
                            <button
                              disabled={busy === e.id + "complete"}
                              onClick={() => handleExchangeComplete(e)}
                              className="flex items-center gap-1.5 rounded-md bg-[#16A34A] px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
                            >
                              <PackageCheck className="h-3.5 w-3.5" />
                              {busy === e.id + "complete" ? "Processing…" : "Complete Exchange"}
                            </button>
                          </div>
                        </div>
                        {msg?.id === e.id && (
                          <div className={`mt-2 rounded-md border px-3 py-1.5 text-[11px] ${msg.ok ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>{msg.text}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
