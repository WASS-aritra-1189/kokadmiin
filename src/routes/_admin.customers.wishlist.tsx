import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Heart, BookOpen, X } from "lucide-react";
import {
  customersService,
  wishlistService,
  type Customer,
  type Wishlist,
} from "@/services/customers.service";

export const Route = createFileRoute("/_admin/customers/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);
  const limit = 20;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customersService.getAll({ page, limit, search: q || undefined });
      setCustomers(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCustomers, q]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Digital Products</div>
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Wishlists</h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">{total} customers — click a row to view their wishlist</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search name or email…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading customers…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-500 text-[13px]">{error}</div>
        ) : customers.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#9CA3AF] text-[13px]">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Phone / Login</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Joined</th>
                  <th className="px-3 py-2 text-left">Wishlist</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-[10px] font-semibold text-[#4F46E5]">
                          {(c.name || c.loginId).split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{c.name || "—"}</div>
                          <div className="text-[10px] text-[#6B7280]">{c.email || c.loginId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[#4B5563]">{c.loginId}</td>
                    <td className="px-3 py-2">
                      <StatusChip status={c.status} />
                    </td>
                    <td className="px-3 py-2 text-[#4B5563]">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1 text-[#4F46E5] text-[11px]">
                        <Heart className="h-3 w-3" /> View
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5E7EB] px-3 py-2">
            <span className="text-[11px] text-[#6B7280]">Page {page} of {totalPages} · {total} total</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]"
              >Prev</button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {selected && <WishlistDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-[#DCFCE7] text-[#166534]",
    INACTIVE: "bg-[#F3F4F6] text-[#4B5563]",
    SUSPENDED: "bg-[#FEE2E2] text-[#991B1B]",
    BLOCKED: "bg-[#FEE2E2] text-[#991B1B]",
  };
  return (
    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (map[status] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
      {status}
    </span>
  );
}

function WishlistDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    wishlistService
      .getByAccount(customer.accountId)
      .then((res) => setWishlists(res.data.data))
      .catch(() => setError("Failed to load wishlist."))
      .finally(() => setLoading(false));
  }, [customer.accountId]);

  const totalItems = wishlists.reduce((s, w) => s + w.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#9333EA] text-[14px] font-semibold text-white">
              {(customer.name || customer.loginId).split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <div className="text-[15px] font-semibold">{customer.name || "—"}</div>
              <div className="text-[11px] text-[#6B7280]">{customer.email || customer.loginId}</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusChip status={customer.status} />
                {!loading && (
                  <span className="text-[10px] text-[#6B7280]">
                    {totalItems} item{totalItems !== 1 ? "s" : ""} in {wishlists.length} list{wishlists.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-[12px]">Loading wishlist…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-500 text-[12px]">{error}</div>
          ) : wishlists.length === 0 || totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF]">
              <Heart className="h-8 w-8 mb-2 opacity-30" />
              <span className="text-[12px]">No wishlist items found.</span>
            </div>
          ) : (
            <div className="space-y-5">
              {wishlists.map((wl) => (
                <div key={wl.id}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart className="h-3 w-3 text-[#4F46E5]" />
                    <span className="text-[11px] font-semibold text-[#374151]">{wl.name}</span>
                    {wl.isDefault && (
                      <span className="rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[9px] font-medium text-[#4F46E5]">Default</span>
                    )}
                    <span className="ml-auto text-[10px] text-[#9CA3AF]">
                      {wl.items.length} item{wl.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {wl.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
                          {item.book.coverImage ? (
                            <img src={item.book.coverImage} alt={item.book.title} className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-[#9CA3AF]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-[#111827] truncate">{item.book.title}</div>
                          <div className="text-[10px] text-[#6B7280]">ISBN: {item.book.isbn}</div>
                          <div className="mt-1 flex items-center gap-2">
                            {item.book.discountPrice && item.book.discountPrice !== item.book.price ? (
                              <>
                                <span className="text-[11px] font-semibold text-[#111827]">₹{item.book.discountPrice}</span>
                                <span className="text-[10px] text-[#9CA3AF] line-through">₹{item.book.price}</span>
                              </>
                            ) : (
                              <span className="text-[11px] font-semibold text-[#111827]">₹{item.book.price}</span>
                            )}
                            <span className={"ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium " +
                              (item.book.status === "ACTIVE" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]")}>
                              {item.book.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
