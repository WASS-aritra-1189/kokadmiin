import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Loader2, Plus, Trash2, X, GripVertical, Eye, EyeOff, Pencil,
  BookOpen, Sparkles, Star, LayoutGrid, Building2, UserRound, Rows3,
} from "lucide-react";
import { homeSectionService, type HomeSection } from "@/services/home-section.service";

export const Route = createFileRoute("/_admin/cms/home-sections")({
  component: HomeSectionsPage,
});

const KNOWN_SECTION_TYPES = [
  "bestsellers", "new_releases", "staff_picks", "book_row",
  "category_scroller", "publisher_scroller", "author_section",
];

// ─── Preset templates ────────────────────────────────────────────────────────
const PRESETS = [
  {
    icon: Star,
    color: "#F59E0B",
    bg: "#FFFBEB",
    label: "Bestsellers",
    sectionType: "bestsellers",
    title: "Bestsellers this week",
    subTitle: "Most loved by readers",
    apiEndpoint: "/books/best-sellers?limit=10",
    config: '{ "limit": 10 }',
    description: "Top selling books row",
  },
  {
    icon: Sparkles,
    color: "#10B981",
    bg: "#ECFDF5",
    label: "New Releases",
    sectionType: "new_releases",
    title: "New Releases",
    subTitle: "Fresh off the press",
    apiEndpoint: "/books/new-releases?limit=10",
    config: '{ "limit": 10 }',
    description: "Latest arrivals book row",
  },
  {
    icon: BookOpen,
    color: "#3B82F6",
    bg: "#EFF6FF",
    label: "Staff Picks",
    sectionType: "staff_picks",
    title: "Staff Picks",
    subTitle: "Handpicked by our team",
    apiEndpoint: "/books/staff-picks?limit=12",
    config: '{ "limit": 12 }',
    description: "Curated book row by staff",
  },
  {
    icon: Rows3,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    label: "Custom Book Row",
    sectionType: "book_row",
    title: "Featured Books",
    subTitle: "A curated selection",
    apiEndpoint: "/books/public?limit=10",
    config: '{ "limit": 10 }',
    description: "Any book row with custom endpoint",
  },
  {
    icon: LayoutGrid,
    color: "#EC4899",
    bg: "#FDF2F8",
    label: "Category Scroller",
    sectionType: "category_scroller",
    title: "Browse by Category",
    subTitle: "Explore",
    apiEndpoint: "",
    config: "",
    description: "Auto-scrolling genre strip",
  },
  {
    icon: Building2,
    color: "#0EA5E9",
    bg: "#F0F9FF",
    label: "Publisher Scroller",
    sectionType: "publisher_scroller",
    title: "Choose from leading publishers",
    subTitle: "Trusted names",
    apiEndpoint: "",
    config: "",
    description: "Auto-scrolling publisher strip",
  },
  {
    icon: UserRound,
    color: "#F97316",
    bg: "#FFF7ED",
    label: "Author Section",
    sectionType: "author_section",
    title: "Browse by Author",
    subTitle: "Meet the writers",
    apiEndpoint: "/authors/featured?limit=20",
    config: '{ "limit": 20 }',
    description: "Featured authors carousel",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────
function HomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverPreset, setDragOverPreset] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await homeSectionService.getAll({ limit: 100 });
      setSections(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load home sections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleToggle = async (section: HomeSection) => {
    try {
      const updated = await homeSectionService.toggle(section.id, !section.isActive);
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, ...updated } : s)));
    } catch {
      alert("Failed to update visibility.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      await homeSectionService.delete(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete section.");
    }
  };

  const handleSaved = (section: HomeSection, isNew: boolean) => {
    if (isNew) {
      setSections((prev) => [...prev, section].sort((a, b) => a.position - b.position));
      setTotal((t) => t + 1);
    } else {
      setSections((prev) => prev.map((s) => (s.id === section.id ? section : s)));
    }
    setModalOpen(false);
    setEditing(null);
  };

  // Open modal pre-filled from a preset
  const openFromPreset = (preset: typeof PRESETS[0]) => {
    setEditing({
      id: "",
      sectionType: preset.sectionType,
      title: preset.title,
      subTitle: preset.subTitle,
      apiEndpoint: preset.apiEndpoint,
      isActive: true,
      config: preset.config ? JSON.parse(preset.config) : null,
      createdAt: "",
      updatedAt: "",
    } as any);
    setModalOpen(true);
  };

  // Drag from preset card → drop onto the active sections list
  const handlePresetDragStart = (e: React.DragEvent, preset: typeof PRESETS[0]) => {
    e.dataTransfer.setData("preset", preset.sectionType);
  };

  const handleSectionListDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPreset(null);
    const presetType = e.dataTransfer.getData("preset");
    if (!presetType) return;
    const preset = PRESETS.find((p) => p.sectionType === presetType);
    if (!preset) return;
    openFromPreset(preset);
  };

  // Reorder within active sections list
  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) return;
    setSections((prev) => {
      const from = prev.findIndex((s) => s.id === dragging);
      const to = prev.findIndex((s) => s.id === targetId);
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };
  const handleDragEnd = async () => {
    setDragging(null);
    try {
      await homeSectionService.reorder(sections.map((s) => s.id));
    } catch {
      alert("Failed to save order.");
    }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Content</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Home Page Sections</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} sections · drag to reorder</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 h-8 rounded-md bg-[#4F46E5] px-3 text-[12px] font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus className="h-3.5 w-3.5" /> Add Custom
        </button>
      </div>

      {/* ── Preset Templates ── */}
      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
          Section Templates — drag onto the list below or click to add
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.sectionType}
                draggable
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                onClick={() => openFromPreset(preset)}
                className="group flex cursor-grab flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-center transition-all hover:border-[#4F46E5] hover:shadow-sm active:cursor-grabbing active:opacity-70 select-none"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                  style={{ background: preset.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: preset.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#111827] leading-tight">{preset.label}</p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF] leading-tight">{preset.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Sections List ── */}
      <div
        className="mt-6"
        onDragOver={(e) => { e.preventDefault(); setDragOverPreset("list"); }}
        onDragLeave={() => setDragOverPreset(null)}
        onDrop={handleSectionListDrop}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
          Active Layout — drag rows to reorder
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-[13px]">{error}</div>
        ) : (
          <div
            className={`space-y-2 min-h-[80px] rounded-xl transition-colors ${
              dragOverPreset === "list" ? "bg-[#EEF2FF] ring-2 ring-[#4F46E5] ring-dashed" : ""
            }`}
          >
            {sections.length === 0 && dragOverPreset !== "list" && (
              <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF] rounded-xl border-2 border-dashed border-[#E5E7EB]">
                <GripVertical className="h-6 w-6 mb-2 opacity-30" />
                <span className="text-[13px]">No sections yet.</span>
                <span className="text-[11px] mt-0.5">Drag a template here or click one above.</span>
              </div>
            )}
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-shadow ${
                  dragging === section.id ? "opacity-50 shadow-lg" : "border-[#E5E7EB]"
                }`}
              >
                <GripVertical className="h-4 w-4 text-[#9CA3AF] cursor-grab shrink-0" />
                <span className="w-5 text-center text-[11px] font-semibold text-[#9CA3AF]">{index + 1}</span>

                {/* Icon from preset */}
                {(() => {
                  const preset = PRESETS.find((p) => p.sectionType === section.sectionType);
                  if (!preset) return null;
                  const Icon = preset.icon;
                  return (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: preset.bg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: preset.color }} />
                    </div>
                  );
                })()}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#111827] truncate">{section.title}</span>
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#6B7280] shrink-0">
                      {section.sectionType}
                    </span>
                    {!KNOWN_SECTION_TYPES.includes(section.sectionType) && (
                      <span className="rounded-full bg-[#FEF9C3] border border-[#FDE047] px-2 py-0.5 text-[10px] font-medium text-[#854D0E] shrink-0">
                        ⚠ not supported yet
                      </span>
                    )}
                  </div>
                  {section.subTitle && (
                    <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{section.subTitle}</p>
                  )}
                  {section.apiEndpoint && (
                    <p className="text-[10px] text-[#6B7280] font-mono truncate mt-0.5">{section.apiEndpoint}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(section)}
                    title={section.isActive ? "Hide section" : "Show section"}
                    className={`rounded-md p-1.5 transition-colors ${
                      section.isActive ? "text-[#10B981] hover:bg-[#ECFDF5]" : "text-[#9CA3AF] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    {section.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => { setEditing(section); setModalOpen(true); }}
                    className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <SectionModal
          section={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function SectionModal({
  section,
  onClose,
  onSaved,
}: {
  section: HomeSection | null;
  onClose: () => void;
  onSaved: (s: HomeSection, isNew: boolean) => void;
}) {
  // If id is empty string it means it came from a preset (new, pre-filled)
  const isNew = !section || section.id === "";
  const [form, setForm] = useState({
    sectionType: section?.sectionType ?? "",
    title: section?.title ?? "",
    subTitle: section?.subTitle ?? "",
    apiEndpoint: section?.apiEndpoint ?? "",
    isActive: section?.isActive ?? true,
    config: section?.config ? JSON.stringify(section.config, null, 2) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  // When admin picks a preset from the dropdown inside the modal
  const applyPreset = (presetType: string) => {
    const preset = PRESETS.find((p) => p.sectionType === presetType);
    if (!preset) return;
    setForm({
      sectionType: preset.sectionType,
      title: preset.title,
      subTitle: preset.subTitle,
      apiEndpoint: preset.apiEndpoint,
      isActive: true,
      config: preset.config,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sectionType.trim() || !form.title.trim()) {
      setError("Section type and title are required.");
      return;
    }
    let config: Record<string, any> | null = null;
    if (form.config.trim()) {
      try { config = JSON.parse(form.config); }
      catch { setError("Config must be valid JSON."); return; }
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        sectionType: form.sectionType.trim(),
        title: form.title.trim(),
        subTitle: form.subTitle.trim() || null,
        apiEndpoint: form.apiEndpoint.trim() || null,
        isActive: form.isActive,
        config,
      };
      const saved = isNew
        ? await homeSectionService.create(payload as any)
        : await homeSectionService.update(section!.id, payload);
      onSaved(saved, isNew);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const matchedPreset = PRESETS.find((p) => p.sectionType === form.sectionType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-2">
            {matchedPreset && (() => {
              const Icon = matchedPreset.icon;
              return (
                <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: matchedPreset.bg }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: matchedPreset.color }} />
                </div>
              );
            })()}
            <h2 className="text-[15px] font-semibold">{isNew ? "Add Section" : "Edit Section"}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Quick-fill from preset */}
          {isNew && (
            <Field label="Quick fill from template">
              <div className="grid grid-cols-4 gap-1.5">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const active = form.sectionType === p.sectionType;
                  return (
                    <button
                      key={p.sectionType}
                      type="button"
                      onClick={() => applyPreset(p.sectionType)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all ${
                        active
                          ? "border-[#4F46E5] bg-[#EEF2FF]"
                          : "border-[#E5E7EB] hover:border-[#4F46E5] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: p.bg }}>
                        <Icon className="h-3 w-3" style={{ color: p.color }} />
                      </div>
                      <span className="text-[9px] font-medium text-[#374151] leading-tight">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          <Field label="Section Type *" hint='Identifier used by the frontend e.g. "bestsellers", "hero_banner"'>
            <input
              value={form.sectionType}
              onChange={(e) => set("sectionType", e.target.value)}
              placeholder="bestsellers"
              className={inputCls}
            />
            {form.sectionType.trim() && !KNOWN_SECTION_TYPES.includes(form.sectionType.trim()) && (
              <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-[#FEF9C3] border border-[#FDE047] px-3 py-2">
                <span className="text-[#854D0E] text-[11px] leading-snug">
                  ⚠️ <strong>"{form.sectionType.trim()}"</strong> is not a known section type. The homepage will not render this section until a developer adds support for it in the frontend code. Use a preset template above to avoid this.
                </span>
              </div>
            )}
          </Field>

          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Bestsellers this week"
              className={inputCls}
            />
          </Field>

          <Field label="Sub Title">
            <input
              value={form.subTitle}
              onChange={(e) => set("subTitle", e.target.value)}
              placeholder="Most loved by readers"
              className={inputCls}
            />
          </Field>

          <Field label="API Endpoint" hint="Backend endpoint that provides data for this section">
            <input
              value={form.apiEndpoint}
              onChange={(e) => set("apiEndpoint", e.target.value)}
              placeholder="/books/public?filter=bestsellers&limit=10"
              className={`${inputCls} font-mono text-[12px]`}
            />
          </Field>

          <Field label="Extra Config (JSON)" hint='Optional e.g. { "limit": 10, "layout": "grid" }'>
            <textarea
              value={form.config}
              onChange={(e) => set("config", e.target.value)}
              rows={3}
              placeholder='{ "limit": 10 }'
              className={`${inputCls} h-auto font-mono text-[11px] resize-none py-2`}
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-[#E5E7EB] accent-[#4F46E5]"
            />
            <label htmlFor="isActive" className="text-[13px] text-[#374151]">Visible on homepage</label>
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
              {saving ? "Saving…" : isNew ? "Add Section" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#4F46E5]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[#374151] mb-1 block">{label}</label>
      {children}
      {hint && <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{hint}</p>}
    </div>
  );
}
