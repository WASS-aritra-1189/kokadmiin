import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Loader2, Plus, Pencil, Trash2, X, ImageIcon, ChevronDown, Eye,
} from "lucide-react";
import { blogService, type Blog, type BlogStatus, type BlogCategory } from "@/services/blog.service";

export const Route = createFileRoute("/_admin/cms/blog")({
  component: BlogPage,
});

const STATUS_COLORS: Record<BlogStatus, string> = {
  ACTIVE: "bg-[#DCFCE7] text-[#166534]",
  DEACTIVE: "bg-[#F3F4F6] text-[#4B5563]",
  PENDING: "bg-[#FEF9C3] text-[#854D0E]",
};

const STATUSES: BlogStatus[] = ["ACTIVE", "DEACTIVE", "PENDING"];
const CATEGORIES: BlogCategory[] = ["GENERAL", "NEWS", "TIPS", "REVIEW", "ANNOUNCEMENT"];

function BlogPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<BlogCategory | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [previewing, setPreviewing] = useState<Blog | null>(null);
  const limit = 12;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await blogService.getAll({
        page, limit,
        search: q || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setPosts(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  }, [page, q, statusFilter, categoryFilter]);

  useEffect(() => {
    const t = setTimeout(fetchPosts, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchPosts, q]);

  const totalPages = Math.ceil(total / limit);

  const handleSaved = (saved: Blog) => {
    setPosts((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    if (!editing) setTotal((t) => t + 1);
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await blogService.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete post.");
    }
  };

  const handleStatusChange = async (post: Blog, status: BlogStatus) => {
    try {
      const updated = await blogService.changeStatus(post.id, status);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...updated } : p)));
    } catch {
      alert("Failed to update status.");
    }
  };

  const openEdit = (post: Blog) => { setEditing(post); setFormOpen(true); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Content</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 h-8 rounded-md bg-[#4F46E5] px-3 text-[12px] font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus className="h-3.5 w-3.5" /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search title, content…"
            className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
          />
        </div>
        <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v as BlogStatus | ""); setPage(1); }} options={STATUSES} placeholder="All Statuses" />
        <FilterSelect value={categoryFilter} onChange={(v) => { setCategoryFilter(v as BlogCategory | ""); setPage(1); }} options={CATEGORIES} placeholder="All Categories" />
      </div>

      {/* Grid */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading posts…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-[13px]">{error}</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
            <span className="text-[13px]">No blog posts found.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onPreview={setPreviewing}
              />
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">Page {page} of {totalPages} · {total} total</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]">Next</button>
          </div>
        </div>
      )}

      {formOpen && (
        <BlogFormDrawer
          post={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {previewing && (
        <PreviewDrawer post={previewing} onClose={() => setPreviewing(null)} />
      )}
    </div>
  );
}

function BlogCard({ post, onEdit, onDelete, onStatusChange, onPreview }: {
  post: Blog;
  onEdit: (p: Blog) => void;
  onDelete: (id: string) => void;
  onStatusChange: (p: Blog, s: BlogStatus) => void;
  onPreview: (p: Blog) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      {/* Cover */}
      <div className="relative h-40 bg-[#F3F4F6] shrink-0">
        {post.coverImage && !imgError ? (
          <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-[#D1D5DB]" />
          </div>
        )}
        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[post.status]}`}>
          {post.status}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <div className="text-[13px] font-semibold text-[#111827] line-clamp-2 leading-snug">{post.title}</div>
        {post.excerpt && (
          <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-2">{post.excerpt}</p>
        )}
        {post.tags && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.split(",").slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[9px] font-medium text-[#4F46E5]">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[10px] text-[#9CA3AF]">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1">
            {/* Status select */}
            <div className="relative">
              <select
                value={post.status}
                onChange={(e) => onStatusChange(post, e.target.value as BlogStatus)}
                className="h-6 appearance-none rounded border border-[#E5E7EB] bg-white pl-1.5 pr-5 text-[10px] text-[#374151] outline-none focus:border-[#4F46E5]"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
            <button onClick={() => onPreview(post)} className="rounded-md p-1 text-[#6B7280] hover:bg-[#F3F4F6]">
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onEdit(post)} className="rounded-md p-1 text-[#6B7280] hover:bg-[#F3F4F6]">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDelete(post.id)} className="rounded-md p-1 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 appearance-none rounded-md border border-[#E5E7EB] bg-white pl-2 pr-6 text-[12px] text-[#374151] outline-none focus:border-[#4F46E5]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
    </div>
  );
}

function BlogFormDrawer({ post, onClose, onSaved }: {
  post: Blog | null;
  onClose: () => void;
  onSaved: (saved: Blog) => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState<BlogCategory>(post?.category ?? "GENERAL");
  const [tags, setTags] = useState(post?.tags ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? "PENDING");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(post?.coverImage ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"content" | "seo">("content");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    setSaving(true);
    setError(null);
    const fields: Record<string, string | undefined> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      category,
      tags: tags.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      status,
    };
    try {
      const saved = post
        ? await blogService.update(post.id, fields, file ?? undefined)
        : await blogService.create(fields, file ?? undefined);
      onSaved(saved);
    } catch {
      setError("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 shrink-0">
          <h2 className="text-[15px] font-semibold">{post ? "Edit Post" : "New Post"}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB] px-5 shrink-0">
          {(["content", "seo"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mr-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {tab === "content" ? (
              <>
                {/* Cover image */}
                <div>
                  <label className="text-[11px] font-medium text-[#374151] mb-1 block">Cover Image</label>
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#FAFAF9] transition-colors hover:border-[#4F46E5] overflow-hidden"
                    style={{ height: preview ? "auto" : "100px" }}
                  >
                    {preview ? (
                      <img src={preview} alt="Cover" className="w-full max-h-48 object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center py-4 text-[#9CA3AF]">
                        <ImageIcon className="h-6 w-6 mb-1" />
                        <span className="text-[11px]">Click to upload cover image</span>
                      </div>
                    )}
                    <input ref={inputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </div>
                </div>

                <Field label="Title *">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className={inputCls} />
                </Field>

                <Field label="Slug">
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if empty" className={inputCls} />
                </Field>

                <Field label="Excerpt">
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary…" rows={2} className={textareaCls} />
                </Field>

                <Field label="Content *">
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your blog post here…" rows={10} className={textareaCls} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category">
                    <div className="relative">
                      <select value={category} onChange={(e) => setCategory(e.target.value as BlogCategory)} className={selectCls}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                  </Field>
                  <Field label="Status">
                    <div className="relative">
                      <select value={status} onChange={(e) => setStatus(e.target.value as BlogStatus)} className={selectCls}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                  </Field>
                </div>

                <Field label="Tags">
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="books, reading, tips (comma-separated)" className={inputCls} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Meta Title">
                  <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" className={inputCls} />
                </Field>
                <Field label="Meta Description">
                  <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="SEO description" rows={4} className={textareaCls} />
                </Field>
                <div className="rounded-lg bg-[#FAFAF9] border border-[#E5E7EB] p-3 text-[11px] text-[#6B7280] space-y-1">
                  <p><span className="font-medium text-[#374151]">Slug:</span> {slug || "(auto-generated)"}</p>
                  <p><span className="font-medium text-[#374151]">Status:</span> {status}</p>
                  <p><span className="font-medium text-[#374151]">Category:</span> {category}</p>
                </div>
              </>
            )}
          </div>

          {error && <p className="px-5 pb-2 text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3 shrink-0">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] px-4 text-[12px] text-[#374151] hover:bg-[#F3F4F6]">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="h-8 rounded-md bg-[#4F46E5] px-4 text-[12px] font-medium text-white disabled:opacity-50 hover:bg-[#4338CA]">
              {saving ? "Saving…" : post ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewDrawer({ post, onClose }: { post: Blog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 shrink-0">
          <h2 className="text-[15px] font-semibold">Preview</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className="w-full max-h-64 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[post.status]}`}>{post.status}</span>
              <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] text-[#4B5563]">{post.category}</span>
              {post.publishedAt && <span className="text-[10px] text-[#9CA3AF]">{new Date(post.publishedAt).toLocaleDateString()}</span>}
            </div>
            <h1 className="text-[22px] font-bold text-[#111827] leading-snug">{post.title}</h1>
            {post.excerpt && <p className="mt-2 text-[14px] text-[#6B7280] italic">{post.excerpt}</p>}
            {post.tags && (
              <div className="mt-3 flex flex-wrap gap-1">
                {post.tags.split(",").map((tag) => (
                  <span key={tag} className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-medium text-[#4F46E5]">{tag.trim()}</span>
                ))}
              </div>
            )}
            <div className="mt-5 border-t border-[#F3F4F6] pt-5 text-[14px] text-[#374151] whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[#374151] mb-1 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]";
const textareaCls = "w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] resize-none";
const selectCls = "h-9 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3 pr-8 text-[13px] outline-none focus:border-[#4F46E5]";
