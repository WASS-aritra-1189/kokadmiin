import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { faqService, type FAQ, type CreateFAQPayload } from "@/services/faq.service";

export const Route = createFileRoute("/_admin/cms/faq")({
  component: FAQPage,
});

function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const limit = 20;

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await faqService.getAll({
        page,
        limit,
        search: q || undefined,
        isActive: activeFilter === "" ? undefined : activeFilter === "true",
      });
      setFaqs(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  }, [page, q, activeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchFaqs, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchFaqs, q]);

  const totalPages = Math.ceil(total / limit);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (faq: FAQ) => { setEditing(faq); setFormOpen(true); };

  const handleSaved = (saved: FAQ) => {
    setFaqs((prev) => {
      const exists = prev.find((f) => f.id === saved.id);
      return exists ? prev.map((f) => (f.id === saved.id ? saved : f)) : [saved, ...prev];
    });
    if (!editing) setTotal((t) => t + 1);
    setFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await faqService.delete(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete FAQ.");
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const updated = await faqService.update(faq.id, { isActive: !faq.isActive });
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, ...updated } : f)));
    } catch {
      alert("Failed to update FAQ.");
    }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Content</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">FAQ</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} questions</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 h-8 rounded-md bg-[#4F46E5] px-3 text-[12px] font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus className="h-3.5 w-3.5" /> Add FAQ
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search question or answer…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value as "" | "true" | "false"); setPage(1); }}
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#374151] outline-none focus:border-[#4F46E5]"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading FAQs…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-500 text-[13px]">{error}</div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF]">
            <span className="text-[13px]">No FAQs found.</span>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {faqs.map((faq) => (
              <div key={faq.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAF9]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium text-[#111827]">{faq.question}</span>
                    {faq.category && (
                      <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-medium text-[#4F46E5]">
                        {faq.category}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${faq.isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]"}`}>
                      {faq.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#6B7280] line-clamp-2">{faq.answer}</p>
                  <span className="mt-1 text-[10px] text-[#9CA3AF]">{new Date(faq.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(faq)}
                    title={faq.isActive ? "Deactivate" : "Activate"}
                    className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(faq)}
                    className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5E7EB] px-3 py-2">
            <span className="text-[11px] text-[#6B7280]">Page {page} of {totalPages} · {total} total</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]">Next</button>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <FAQFormModal
          faq={editing}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function FAQFormModal({ faq, onClose, onSaved }: {
  faq: FAQ | null;
  onClose: () => void;
  onSaved: (saved: FAQ) => void;
}) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "");
  const [isActive, setIsActive] = useState(faq?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError("Question and answer are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CreateFAQPayload = {
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim() || undefined,
      isActive,
    };
    try {
      const saved = faq
        ? await faqService.update(faq.id, payload)
        : await faqService.create(payload);
      onSaved(saved);
    } catch {
      setError("Failed to save FAQ. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-[15px] font-semibold">{faq ? "Edit FAQ" : "Add FAQ"}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-[#374151] mb-1 block">Question <span className="text-red-500">*</span></label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is your return policy?"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#374151] mb-1 block">Answer <span className="text-red-500">*</span></label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write the answer here…"
              rows={4}
              className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#374151] mb-1 block">Category <span className="text-[#9CA3AF]">(optional)</span></label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Returns, Shipping, Payments"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#E5E7EB] accent-[#4F46E5]"
            />
            <label htmlFor="isActive" className="text-[13px] text-[#374151]">Active (visible on public FAQ page)</label>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] px-4 text-[12px] text-[#374151] hover:bg-[#F3F4F6]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-8 rounded-md bg-[#4F46E5] px-4 text-[12px] font-medium text-white disabled:opacity-50 hover:bg-[#4338CA]"
            >
              {saving ? "Saving…" : faq ? "Save Changes" : "Create FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
