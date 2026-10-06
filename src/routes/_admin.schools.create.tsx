import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { schoolService } from "@/services/school.service";

export const Route = createFileRoute("/_admin/schools/create")({
  component: SchoolCreatePage,
});

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "INACTIVE", "REJECTED"];

function SchoolCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    description: "",
    status: "ACTIVE",
    showInEcommerce: false,
  });

  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("School name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await schoolService.create(form);
      navigate({ to: "/admin/schools/" });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create school.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate({ to: "/admin/schools/" })}
        className="mb-4 flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#111827]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Schools
      </button>

      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Schools</div>
      <h1 className="text-[22px] font-semibold tracking-tight">New School</h1>
      <p className="mt-1 mb-6 text-[13px] text-[#6B7280]">Add a new school to the system.</p>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 space-y-5">
        {error && (
          <div className="rounded-md bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-[12px] text-[#DC2626]">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">
            School Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. St. Mary's High School"
            className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="school@example.com"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 9876543210"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Address</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street address"
            className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">City</label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="City"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">State</label>
            <input
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="State"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Pincode</label>
            <input
              value={form.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              placeholder="600001"
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Brief description about the school…"
            rows={3}
            className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showInEcommerce}
                onChange={(e) => set("showInEcommerce", e.target.checked)}
                className="h-4 w-4 rounded accent-[#4F46E5]"
              />
              <span className="text-[12px] font-medium text-[#374151]">Show in Ecommerce Store</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#F3F4F6] pt-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/schools/" })}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white hover:bg-[#1F2937] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {saving ? "Creating…" : "Create School"}
          </button>
        </div>
      </form>
    </div>
  );
}
