import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Plus, Trash2, X, ImageIcon, ChevronDown } from "lucide-react";
import { bannerService, resolveBannerImage, type Banner, type BannerStatus } from "@/services/banner.service";

export const Route = createFileRoute("/_admin/cms/banners")({
  component: BannersPage,
});

const STATUS_COLORS: Record<BannerStatus, string> = {
  ACTIVE: "bg-[#DCFCE7] text-[#166534]",
  DEACTIVE: "bg-[#F3F4F6] text-[#4B5563]",
  PENDING: "bg-[#FEF9C3] text-[#854D0E]",
  DELETED: "bg-[#FEE2E2] text-[#991B1B]",
};

const STATUSES: BannerStatus[] = ["ACTIVE", "DEACTIVE", "PENDING"];

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BannerStatus | "">("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const limit = 20;

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bannerService.getAll({
        page,
        limit,
        status: statusFilter || undefined,
      });
      setBanners(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const totalPages = Math.ceil(total / limit);

  const handleStatusChange = async (banner: Banner, status: BannerStatus) => {
    try {
      const updated = await bannerService.changeStatus(banner.id, status);
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, ...updated } : b)));
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await bannerService.delete(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete banner.");
    }
  };

  const handleUploaded = (banner: Banner) => {
    setBanners((prev) => [banner, ...prev]);
    setTotal((t) => t + 1);
    setUploadOpen(false);
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Content</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Banners</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} banners</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1.5 h-8 rounded-md bg-[#4F46E5] px-3 text-[12px] font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus className="h-3.5 w-3.5" /> Upload Banner
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex items-center gap-2">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as BannerStatus | ""); setPage(1); }}
            className="h-8 appearance-none rounded-md border border-[#E5E7EB] bg-white pl-2 pr-6 text-[12px] text-[#374151] outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading banners…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-[13px]">{error}</div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
            <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
            <span className="text-[13px]">No banners found.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
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

      {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
      )}
    </div>
  );
}

function BannerCard({ banner, onStatusChange, onDelete }: {
  banner: Banner;
  onStatusChange: (b: Banner, s: BannerStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const src = resolveBannerImage(banner);

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      {/* Image */}
      <div className="relative h-40 bg-[#F3F4F6]">
        {src && !imgError ? (
          <img
            src={src}
            alt="Banner"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#9CA3AF]">
            <ImageIcon className="h-8 w-8 opacity-40" />
          </div>
        )}
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[banner.status]}`}>
          {banner.status}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] text-[#9CA3AF]">{new Date(banner.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-1">
          {/* Status toggle */}
          <div className="relative">
            <select
              value={banner.status}
              onChange={(e) => onStatusChange(banner, e.target.value as BannerStatus)}
              className="h-6 appearance-none rounded border border-[#E5E7EB] bg-white pl-1.5 pr-5 text-[10px] text-[#374151] outline-none focus:border-[#4F46E5]"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
          <button
            onClick={() => onDelete(banner.id)}
            className="rounded-md p-1 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUploaded }: {
  onClose: () => void;
  onUploaded: (b: Banner) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<BannerStatus>("ACTIVE");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select an image."); return; }
    setUploading(true);
    setError(null);
    try {
      const saved = await bannerService.create(file, status);
      onUploaded(saved);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-[15px] font-semibold">Upload Banner</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#FAFAF9] py-8 transition-colors hover:border-[#4F46E5] hover:bg-[#EEF2FF]/30"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-40 rounded-md object-contain" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-[#9CA3AF] mb-2" />
                <p className="text-[12px] text-[#6B7280]">Click or drag & drop an image</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">PNG, JPG, WEBP</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {file && (
            <p className="text-[11px] text-[#6B7280]">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          )}

          {/* Status */}
          <div>
            <label className="text-[11px] font-medium text-[#374151] mb-1 block">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BannerStatus)}
                className="h-9 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3 pr-8 text-[13px] outline-none focus:border-[#4F46E5]"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] px-4 text-[12px] text-[#374151] hover:bg-[#F3F4F6]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="h-8 rounded-md bg-[#4F46E5] px-4 text-[12px] font-medium text-white disabled:opacity-50 hover:bg-[#4338CA]"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
