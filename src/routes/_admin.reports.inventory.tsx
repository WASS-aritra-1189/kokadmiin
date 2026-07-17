import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Package, AlertTriangle, Layers, Shield } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";

export const Route = createFileRoute("/_admin/reports/inventory")({
  component: InventoryReportPage,
});

function InventoryReportPage() {
  const [inventory, setInventory] = useState<Array<{ id: string; title: string; isbn: string; stock: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lowStock = useMemo(() => inventory.filter((item) => item.stock > 0 && item.stock <= 10), [inventory]);
  const outOfStock = useMemo(() => inventory.filter((item) => item.stock === 0), [inventory]);
  const totalStock = useMemo(() => inventory.reduce((sum, item) => sum + item.stock, 0), [inventory]);
  const avgStock = useMemo(() => (inventory.length ? Math.round(totalStock / inventory.length) : 0), [inventory, totalStock]);
  const chartData = useMemo(() => {
    return inventory
      .slice(0, 8)
      .map((item) => ({ name: item.title.length > 22 ? item.title.slice(0, 22) + "..." : item.title, stock: item.stock }));
  }, [inventory]);

  const normalizeInventoryPayload = (payload: any) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.payload && Array.isArray(payload.payload)) return payload.payload;
    return [];
  };

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getInventoryStatus();
      setInventory(normalizeInventoryPayload(response));
    } catch (err: any) {
      setError(err?.message || "Failed to load inventory status.");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Reports</div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#111827]">Inventory Analysis</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#6B7280]">Live stock levels for active products, low stock alerts, and a quick inventory health overview for your catalog.</p>
        </div>
        <button
          onClick={loadInventory}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 text-[12px] font-semibold text-[#374151] shadow-sm transition hover:border-[#C7D2FE] hover:bg-[#F8FAFF]"
        >
          <Download className="h-4 w-4" /> Refresh data
        </button>
      </div>

      {loading && <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 text-center text-[12px] text-[#6B7280] shadow-sm">Loading inventory data…</div>}
      {error && <div className="mt-6 rounded-3xl border border-[#FEE2E2] bg-[#FEF2F2] p-4 text-[12px] text-[#B91C1C] shadow-sm">{error}</div>}

      {!loading && !error && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Layers} title="Active products" subtitle="Products currently active" value={inventory.length} />
            <StatCard icon={AlertTriangle} title="Low stock" subtitle="10 items or fewer" value={lowStock.length} accent="amber" />
            <StatCard icon={Package} title="Out of stock" subtitle="Products needing restock" value={outOfStock.length} accent="rose" />
            <StatCard icon={Shield} title="Average stock" subtitle="Average units per product" value={avgStock} accent="sky" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr,0.9fr]">
            <div className="rounded-[24px] border border-[#E6E9EF] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
                <div>
                  <div className="text-[13px] font-semibold text-[#111827]">Stock overview</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">Top active products by stock quantity.</div>
                </div>
                <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold text-[#2563EB]">Updated live</div>
              </div>
              <div className="mt-4 h-[320px]">
                {chartData.length ? (
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 18, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB' }} formatter={(value: number) => [value, 'Units']} />
                      <Bar dataKey="stock" fill="#4338CA" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] text-[#6B7280]">No inventory data available.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#E6E9EF] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">Low stock products</div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">Items that need attention first.</div>
                  </div>
                  <div className="rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-semibold text-[#B45309]">{lowStock.length} items</div>
                </div>
                <div className="mt-4 space-y-3">
                  {lowStock.length ? (
                    lowStock.slice(0, 8).map((item) => (
                      <div key={item.id} className="rounded-3xl border border-[#E5E7EB] bg-[#FFFBEB] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-[#111827]">{item.title}</div>
                            <div className="mt-1 text-[11px] text-[#6B7280]">{item.isbn}</div>
                          </div>
                          <span className="rounded-full bg-[#FEE2E2] px-3 py-1 text-[12px] font-semibold text-[#B91C1C]">{item.stock} left</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-[12px] text-[#6B7280]">No low stock products found.</div>
                  )}
                </div>
              </div>
              <div className="rounded-[24px] border border-[#E6E9EF] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">Out of stock</div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">Products that must be replenished.</div>
                  </div>
                  <div className="rounded-full bg-[#FEE2E2] px-3 py-1 text-[11px] font-semibold text-[#B91C1C]">{outOfStock.length} items</div>
                </div>
                <div className="mt-4 space-y-3">
                  {outOfStock.length ? (
                    outOfStock.slice(0, 8).map((item) => (
                      <div key={item.id} className="rounded-3xl border border-[#F5D0FE] bg-[#FDF2F8] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-[#111827]">{item.title}</div>
                            <div className="mt-1 text-[11px] text-[#6B7280]">{item.isbn}</div>
                          </div>
                          <span className="rounded-full bg-[#FEE2E2] px-3 py-1 text-[12px] font-semibold text-[#B91C1C]">Out</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-[12px] text-[#6B7280]">No out-of-stock items found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#E6E9EF] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[#F3F4F6] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Inventory detail</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Active products sorted by title.</div>
              </div>
              <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold text-[#2563EB]">Total stock: {totalStock}</div>
            </div>
            <div className="overflow-x-auto p-2">
              <table className="min-w-full text-[12px]">
                <thead className="bg-[#FAFAFA] text-[10px] uppercase text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">ISBN</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-semibold text-[#111827]">{item.title}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{item.isbn}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#111827] tabular-nums">{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, accent }: { icon: any; title: string; subtitle?: string; value: number; accent?: string }) {
  const accentStyles = {
    amber: 'bg-[#FEF3C7] text-[#B45309]',
    rose: 'bg-[#FEE2E2] text-[#B91C1C]',
    sky: 'bg-[#EFF6FF] text-[#2563EB]',
  };
  const accentClass = accent ? accentStyles[accent as keyof typeof accentStyles] : 'bg-[#EEF2FF] text-[#4338CA]';

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${accentClass}`}><Icon className="h-5 w-5" /></span>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{title}</div>
          {subtitle ? <div className="mt-1 text-[11px] text-[#6B7280]">{subtitle}</div> : null}
          <div className="mt-2 text-[24px] font-semibold text-[#111827]">{value}</div>
        </div>
      </div>
    </div>
  );
}
