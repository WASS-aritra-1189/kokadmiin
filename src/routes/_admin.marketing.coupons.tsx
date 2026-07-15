import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { couponService, type Coupon } from "@/services/catalog-extra.service";

export const Route = createFileRoute("/_admin/marketing/coupons")({ component: CouponsPage });

const LIMIT = 10;

function CouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: Coupon | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await couponService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await couponService.delete(id);
    load();
  };

  const now = new Date();
  const active = items.filter(c => c.isActive && new Date(c.expiresAt) > now).length;
  const expired = items.filter(c => new Date(c.expiresAt) <= now).length;
  const scheduled = items.filter(c => new Date(c.startsAt) > now).length;

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Marketing</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Coupons & discount codes</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Create percentage and flat-off offers with usage caps.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
        >
          <Plus className="h-3.5 w-3.5" />New coupon
        </button>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {[["Active", active, "#10B981"], ["Scheduled", scheduled, "#F59E0B"], ["Expired", expired, "#6B7280"], ["Total redemptions", items.reduce((a, c) => a + (c.usageCount ?? 0), 0).toLocaleString("en-IN"), "#4F46E5"]].map(([l, v, t]) => (
          <div key={l} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: t as string }}>{l}</div>
            <div className="mt-1 text-[22px] font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search coupons…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Value</th>
                <th className="px-3 py-2 text-right">Min order</th>
                <th className="px-3 py-2 text-left">Usage</th>
                <th className="px-3 py-2 text-left">Window</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-3 py-8 text-center text-[#6B7280]">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-[#6B7280]">No coupons found.</td></tr>}
              {!loading && items.map((c) => {
                const isExpired = new Date(c.expiresAt) <= now;
                const isScheduled = new Date(c.startsAt) > now;
                const statusLabel = isExpired ? "Expired" : isScheduled ? "Scheduled" : c.isActive ? "Active" : "Inactive";
                const statusCls = isExpired ? "bg-[#F3F4F6] text-[#4B5563]" : isScheduled ? "bg-[#FEF3C7] text-[#92400E]" : c.isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]";
                return (
                  <tr key={c.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                    <td className="px-3 py-2"><span className="rounded-md bg-[#111827] px-2 py-0.5 font-mono text-[11px] font-medium text-white">{c.code}</span></td>
                    <td className="px-3 py-2 text-[#4B5563]">{c.discountType}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[#4B5563]">₹{c.minOrderAmount}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {c.totalUsageLimit ? (
                          <>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#F3F4F6]">
                              <div className="h-full bg-[#4F46E5]" style={{ width: `${Math.min(100, ((c.usageCount ?? 0) / c.totalUsageLimit) * 100)}%` }} />
                            </div>
                            <span className="text-[11px] tabular-nums text-[#6B7280]">{c.usageCount ?? 0} / {c.totalUsageLimit}</span>
                          </>
                        ) : <span className="text-[11px] text-[#6B7280]">{c.usageCount ?? 0} used</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-[#4B5563]">
                      {new Date(c.startsAt).toLocaleDateString("en-IN")} → {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-3 py-2"><span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + statusCls}>{statusLabel}</span></td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setSheet({ open: true, item: c })} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="rounded-md border border-[#FEE2E2] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div>Showing <span className="font-medium text-[#111827]">{items.length}</span> of {total}</div>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={"rounded-md px-2 py-1 " + (p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {sheet.open && (
        <CouponSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(); }}
        />
      )}
    </div>
  );
}

function CouponSheet({ item, onClose, onSaved }: { item: Coupon | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    code: item?.code ?? "",
    discountType: item?.discountType ?? "PERCENTAGE",
    discountValue: item?.discountValue ?? "",
    minOrderAmount: item?.minOrderAmount ?? "",
    maxDiscountAmount: item?.maxDiscountAmount ?? "",
    totalUsageLimit: item?.totalUsageLimit ?? "",
    perUserLimit: item?.perUserLimit ?? 1,
    startsAt: item?.startsAt ? item.startsAt.slice(0, 10) : "",
    expiresAt: item?.expiresAt ? item.expiresAt.slice(0, 10) : "",
    description: item?.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inp = "h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]";
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : undefined,
        perUserLimit: Number(form.perUserLimit),
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
      };
      if (isEdit) await couponService.update(item.id, payload);
      else await couponService.create(payload as any);
      onSaved();
    } catch (err: any) {
      const msg = err.response?.data?.data?.errors?.[0] ?? err.response?.data?.message ?? "Something went wrong";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit coupon" : "New coupon"}</div>
            <div className="text-[15px] font-semibold">{form.code || "Untitled"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && <div className="rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Code *</label>
                <input required value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. SAVE20" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Type *</label>
                <select required value={form.discountType} onChange={(e) => set("discountType", e.target.value)} className={inp}>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Value *</label>
                <input required type="number" min={0.01} step="0.01" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} placeholder={form.discountType === "PERCENTAGE" ? "20" : "100"} className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Min order (₹)</label>
                <input type="number" min={0} value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} placeholder="499" className={inp} />
              </div>
              {form.discountType === "PERCENTAGE" && (
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Max discount (₹)</label>
                  <input type="number" min={0} value={form.maxDiscountAmount} onChange={(e) => set("maxDiscountAmount", e.target.value)} placeholder="200" className={inp} />
                </div>
              )}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Total usage limit</label>
                <input type="number" min={1} value={form.totalUsageLimit} onChange={(e) => set("totalUsageLimit", e.target.value)} placeholder="1000" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Per user limit</label>
                <input type="number" min={1} value={form.perUserLimit} onChange={(e) => set("perUserLimit", e.target.value)} placeholder="1" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Starts *</label>
                <input required type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Expires *</label>
                <input required type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={inp} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description…" className="w-full rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#4F46E5]" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151]">Cancel</button>
            <button type="submit" disabled={saving} className="h-8 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
