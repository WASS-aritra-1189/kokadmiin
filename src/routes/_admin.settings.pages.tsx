import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pagesService, PAGE_TYPES, type Page } from "@/services/pages.service";
import { toast } from "sonner";
import { FileText, Edit, Plus, X, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/pages")({
  component: PagesSettings,
  head: () => ({ meta: [{ title: "Pages — BookAdmin" }] }),
});

function PagesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 20;

  const [formData, setFormData] = useState({
    title: "",
    pageType: "ABOUT_US",
    description: "",
  });

  useEffect(() => {
    loadPages();
  }, [page, statusFilter]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const res = await pagesService.getAll({
        page,
        limit,
        status: statusFilter ? [statusFilter] : undefined,
      });
      setPages(res.data || []);
    } catch (error) {
      console.error("Failed to load pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== "")
      );

      if (editPage?.id) {
        await pagesService.update(editPage.id, dataToSave);
        toast.success("Page saved successfully");
      } else {
        await pagesService.create(dataToSave);
        toast.success("Page created successfully");
      }
      handleCancel();
      loadPages();
    } catch (error: any) {
      console.error("Failed to save page:", error);
      const msg = error?.response?.data?.data?.errors?.[0] || error?.response?.data?.message || "Failed to save page";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditPage(page);
    setFormData({
      title: page.title || "",
      pageType: page.pageType || "ABOUT_US",
      description: page.description || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditPage(null);
    setFormData({ title: "", pageType: "ABOUT_US", description: "" });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-[#DCFCE7] text-[#166534]";
      case "DEACTIVE": return "bg-[#F3F4F6] text-[#4B5563]";
      default: return "bg-[#FEF9C3] text-[#854D0E]";
    }
  };

  const handleStatusChange = async (pageId: string, status: string) => {
    try {
      await pagesService.updateStatus(pageId, status);
      toast.success("Status updated successfully");
      loadPages();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Content</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Pages</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{pages.length} pages</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 h-8 rounded-md bg-[#4F46E5] px-3 text-[12px] font-medium text-white hover:bg-[#4338CA]"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Page
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex items-center gap-2">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-8 appearance-none rounded-md border border-[#E5E7EB] bg-white pl-2 pr-6 text-[12px] text-[#374151] outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
            <option value="PENDING">Pending</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={handleCancel}>
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <h2 className="text-[15px] font-semibold">{editPage ? "Edit Page" : "New Page"}</h2>
              <button onClick={handleCancel} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-medium text-[#374151] mb-1 block">Page Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter page title"
                  className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#374151] mb-1 block">Page Type</label>
                <div className="relative">
                  <select
                    value={formData.pageType}
                    onChange={(e) => updateField("pageType", e.target.value)}
                    className="h-9 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3 pr-8 text-[13px] outline-none focus:border-[#4F46E5]"
                  >
                    {PAGE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#374151] mb-1 block">Content</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Enter page content (HTML supported)"
                  className="min-h-[200px] w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-8 rounded-md border border-[#E5E7EB] px-4 text-[12px] text-[#374151] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.title}
                  className="h-8 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-50 hover:bg-[#1F2937]"
                >
                  {saving ? "Saving..." : "Save Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-2"></div>
            <span className="text-[13px]">Loading pages…</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
            <FileText className="h-10 w-10 mb-2 opacity-30" />
            <span className="text-[13px]">No pages found.</span>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EEF2FF] text-[#4F46E5]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#111827]">{page.title}</div>
                    <div className="text-[11.5px] text-[#6B7280]">
                      {PAGE_TYPES.find(t => t.value === page.pageType)?.label || page.pageType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={page.status}
                      onChange={(e) => handleStatusChange(page.id, e.target.value)}
                      className={`h-6 appearance-none rounded border border-[#E5E7EB] bg-white pl-1.5 pr-5 text-[10px] outline-none focus:border-[#4F46E5] ${getStatusColor(page.status).split(' ')[1]}`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DEACTIVE">Deactive</option>
                      <option value="PENDING">Pending</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                  <button
                    onClick={() => handleEdit(page)}
                    className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}