import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Star, X, Check, Trash2, BookOpen, Filter } from "lucide-react";
import { reviewsService, type Review, type ReviewStatus } from "@/services/reviews.service";

export const Route = createFileRoute("/_admin/customers/reviews")({
  component: ReviewsPage,
});

const STATUS_FILTERS: { label: string; value: ReviewStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

type SearchMode = "accountId" | "bookId";

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("accountId");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Review | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 20;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (q) params[searchMode] = q;
      const res = await reviewsService.getAll(params);
      setReviews(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, q, searchMode]);

  useEffect(() => {
    const t = setTimeout(fetchReviews, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchReviews, q]);

  const handleStatus = async (id: string, status: ReviewStatus, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActionLoading(id + status);
    try {
      const updated = await reviewsService.updateStatus(id, status);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      if (selected?.id === id) setSelected((s) => (s ? { ...s, ...updated } : s));
    } catch {
      // silent — row stays unchanged
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id + "delete");
    try {
      await reviewsService.adminDelete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => t - 1);
      if (selected?.id === id) setSelected(null);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Customers</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Reviews & Ratings</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {total} review{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          {/* Search mode toggle */}
          <div className="flex items-center gap-1 rounded-md border border-[#E5E7EB] p-0.5">
            <button
              onClick={() => { setSearchMode("accountId"); setQ(""); setPage(1); }}
              className={"h-7 rounded px-2 text-[11px] font-medium transition-colors " +
                (searchMode === "accountId" ? "bg-[#4F46E5] text-white" : "text-[#6B7280] hover:bg-[#F3F4F6]")}
            >
              <Filter className="mr-1 inline h-3 w-3" />Account
            </button>
            <button
              onClick={() => { setSearchMode("bookId"); setQ(""); setPage(1); }}
              className={"h-7 rounded px-2 text-[11px] font-medium transition-colors " +
                (searchMode === "bookId" ? "bg-[#4F46E5] text-white" : "text-[#6B7280] hover:bg-[#F3F4F6]")}
            >
              <BookOpen className="mr-1 inline h-3 w-3" />Book
            </button>
          </div>

          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder={searchMode === "accountId" ? "Filter by Account ID (UUID)…" : "Filter by Book ID (UUID)…"}
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={"h-8 rounded-md px-3 text-[11px] font-medium border transition-colors " +
                  (statusFilter === f.value
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B7280]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="text-[13px]">Loading reviews…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-[13px] text-red-500">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[13px] text-[#9CA3AF]">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                  <th className="px-3 py-2 text-left">Book</th>
                  <th className="px-3 py-2 text-left">Rating</th>
                  <th className="px-3 py-2 text-left">Review</th>
                  <th className="px-3 py-2 text-left">Account ID</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="cursor-pointer border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]"
                  >
                    <td className="px-3 py-2 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
                          {r.book?.coverImage
                            ? <img src={r.book.coverImage} alt="" className="h-8 w-8 rounded-md object-cover" />
                            : <BookOpen className="h-3.5 w-3.5 text-[#9CA3AF]" />}
                        </div>
                        <span className="truncate font-medium text-[#111827]">
                          {r.book?.title ?? r.bookTitle ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StarRating value={r.rating} />
                    </td>
                    <td className="px-3 py-2 max-w-[220px]">
                      <span className="line-clamp-2 text-[#4B5563]">
                        {r.review ? String(r.review) : <span className="italic text-[#9CA3AF]">No text</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#6B7280] font-mono text-[10px] max-w-[120px] truncate">{r.accountId}</td>
                    <td className="px-3 py-2"><StatusChip status={r.status} /></td>
                    <td className="px-3 py-2 text-[#6B7280] whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {r.status !== "APPROVED" && (
                          <ActionBtn
                            title="Approve"
                            loading={actionLoading === r.id + "APPROVED"}
                            onClick={(e) => handleStatus(r.id, "APPROVED", e)}
                            className="text-[#16A34A] hover:bg-[#DCFCE7]"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </ActionBtn>
                        )}
                        {r.status !== "REJECTED" && (
                          <ActionBtn
                            title="Reject"
                            loading={actionLoading === r.id + "REJECTED"}
                            onClick={(e) => handleStatus(r.id, "REJECTED", e)}
                            className="text-[#DC2626] hover:bg-[#FEE2E2]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </ActionBtn>
                        )}
                        <ActionBtn
                          title="Delete"
                          loading={actionLoading === r.id + "delete"}
                          onClick={(e) => handleDelete(r.id, e)}
                          className="text-[#6B7280] hover:bg-[#F3F4F6]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                      </div>
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

      {selected && (
        <ReviewDrawer
          review={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatus}
          onDelete={handleDelete}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ value }: { value: number | string }) {
  const num = Number(value) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={"h-3 w-3 " + (i <= Math.round(num) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#D1D5DB]")}
        />
      ))}
      <span className="ml-1 text-[10px] text-[#6B7280]">{num.toFixed(1)}</span>
    </div>
  );
}

function StatusChip({ status }: { status: ReviewStatus | string }) {
  const map: Record<string, string> = {
    PENDING: "bg-[#FEF3C7] text-[#92400E]",
    APPROVED: "bg-[#DCFCE7] text-[#166534]",
    REJECTED: "bg-[#FEE2E2] text-[#991B1B]",
  };
  return (
    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (map[status] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
      {status}
    </span>
  );
}

function ActionBtn({
  children, title, loading, onClick, className,
}: {
  children: React.ReactNode;
  title: string;
  loading: boolean;
  onClick: (e: React.MouseEvent) => void;
  className: string;
}) {
  return (
    <button
      title={title}
      disabled={loading}
      onClick={onClick}
      className={"flex h-6 w-6 items-center justify-center rounded transition-colors disabled:opacity-40 " + className}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : children}
    </button>
  );
}

function ReviewDrawer({
  review, onClose, onStatusChange, onDelete, actionLoading,
}: {
  review: Review;
  onClose: () => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}) {
  const bookTitle = review.book?.title ?? review.bookTitle ?? "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <div className="text-[15px] font-semibold">Review Detail</div>
            <div className="mt-0.5 text-[11px] text-[#6B7280]">{new Date(review.createdAt).toLocaleString()}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Book */}
          <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
              {review.book?.coverImage
                ? <img src={review.book.coverImage} alt="" className="h-12 w-12 rounded-md object-cover" />
                : <BookOpen className="h-5 w-5 text-[#9CA3AF]" />}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#111827] truncate">{bookTitle}</div>
              {review.book?.isbn && <div className="text-[10px] text-[#6B7280]">ISBN: {review.book.isbn}</div>}
              <div className="mt-1"><StarRating value={review.rating} /></div>
            </div>
          </div>

          {/* Review text */}
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">Review</div>
            <div className="rounded-lg border border-[#E5E7EB] p-3 text-[12px] text-[#374151] leading-relaxed min-h-[60px]">
              {review.review ? String(review.review) : <span className="italic text-[#9CA3AF]">No written review.</span>}
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <Row label="Status" value={<StatusChip status={review.status} />} />
            <Row label="Account ID" value={<span className="font-mono text-[11px]">{review.accountId}</span>} />
            <Row label="Book ID" value={<span className="font-mono text-[11px]">{review.bookId}</span>} />
            <Row label="Submitted" value={review.createdAt ? new Date(review.createdAt).toLocaleString() : "—"} />
            <Row label="Updated" value={review.updatedAt ? new Date(review.updatedAt).toLocaleString() : "—"} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {review.status !== "APPROVED" && (
              <button
                disabled={actionLoading === review.id + "APPROVED"}
                onClick={() => onStatusChange(review.id, "APPROVED")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#16A34A] py-2 text-[12px] font-medium text-white hover:bg-[#15803D] disabled:opacity-50"
              >
                {actionLoading === review.id + "APPROVED"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Check className="h-3.5 w-3.5" />}
                Approve
              </button>
            )}
            {review.status !== "REJECTED" && (
              <button
                disabled={actionLoading === review.id + "REJECTED"}
                onClick={() => onStatusChange(review.id, "REJECTED")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] py-2 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] disabled:opacity-50"
              >
                {actionLoading === review.id + "REJECTED"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <X className="h-3.5 w-3.5" />}
                Reject
              </button>
            )}
            <button
              disabled={actionLoading === review.id + "delete"}
              onClick={() => onDelete(review.id)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-[12px] font-medium text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-50"
            >
              {actionLoading === review.id + "delete"
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2 text-[12px]">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-medium text-[#111827]">{value}</span>
    </div>
  );
}
