// src/routes/_admin/schools/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { schoolService, type School } from "@/services/school.service";

export const Route = createFileRoute("/_admin/schools/")({
  component: SchoolsPage,
});

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF9C3] text-[#854D0E]",
  INACTIVE: "bg-[#F3F4F6] text-[#4B5563]",
  REJECTED: "bg-[#FEE2E2] text-[#991B1B]",
};

function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewSchool, setViewSchool] = useState<School | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    loadSchools();
  }, [page, statusFilter, limit]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      
      const response = await schoolService.getAll(params);
      console.log("API Response:", response);
      
      // Response structure: { data: School[], total: number, page: number, limit: number }
      setSchools(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error loading schools:", error);
      setSchools([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadSchools();
  };

  const handleViewSchool = async (schoolId: string) => {
    setViewLoading(true);
    setViewSchool(null);
    try {
      const school = await schoolService.getById(schoolId);
      console.log("School details:", school);
      setViewSchool(school);
    } catch (err) {
      console.error("Failed to fetch school details:", err);
      alert("Failed to load school details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (school: School) => {
    if (!confirm(`Are you sure you want to delete "${school.name}"?`)) return;
    try {
      await schoolService.delete(school.id);
      loadSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete school");
    }
  };

  const toggleSelection = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const allChecked = schools.length > 0 && schools.every((s) => selected.has(s.id));
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Schools</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">School Management</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} schools in the system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/schools/create"
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"
          >
            <Plus className="h-3.5 w-3.5" />New school
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              placeholder="Search schools by name, city, email…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            Status:
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827] outline-none"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="w-8 px-3 py-2">
                  <input 
                    type="checkbox" 
                    checked={allChecked} 
                    onChange={() => setSelected(allChecked ? new Set() : new Set(schools.map((s) => s.id)))} 
                  />
                </th>
                <th className="px-3 py-2 text-left">School Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#6B7280]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading schools...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && schools.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#6B7280]">
                    No schools found.
                  </td>
                </tr>
              )}
              {!loading && schools.map((school) => (
                <tr key={school.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2">
                    <input 
                      type="checkbox" 
                      checked={selected.has(school.id)} 
                      onChange={() => toggleSelection(school.id)} 
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-[#1F2937]">{school.name}</div>
                  </td>
                  <td className="px-3 py-2 text-[#4B5563]">{school.email || "—"}</td>
                  <td className="px-3 py-2 text-[#4B5563]">{school.phone || "—"}</td>
                  <td className="px-3 py-2 text-[#4B5563]">
                    {[school.city, school.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (STATUS_COLOR[school.status] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                      {school.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewSchool(school.id)}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#4F46E5] hover:bg-[#EEF2FF]"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        to={`/admin/schools/${school.id}/edit`}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(school)}
                        className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-3">
            <span>Showing <span className="font-medium text-[#111827]">{schools.length}</span> of {total}</span>
            <label className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#111827] outline-none focus:border-[#4F46E5]"
              >
                {[10, 20, 50, 100].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage((p) => p - 1)} 
              className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button 
                key={p} 
                onClick={() => setPage(p)} 
                className={"rounded-md px-2 py-1 " + (p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span>...</span>}
            {totalPages > 5 && (
              <button 
                onClick={() => setPage(totalPages)} 
                className={"rounded-md px-2 py-1 " + (totalPages === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}
              >
                {totalPages}
              </button>
            )}
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage((p) => p + 1)} 
              className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* School Detail View Modal */}
      {viewSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewSchool(null)}>
          <div 
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">School Details</div>
                <div className="flex items-center gap-3">
                  <h2 className="text-[18px] font-semibold">{viewSchool.name}</h2>
                  <span className={"rounded-full px-2 py-0.5 text-[11px] font-medium " + (STATUS_COLOR[viewSchool.status] ?? "bg-[#F3F4F6] text-[#4B5563]")}>
                    {viewSchool.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setViewSchool(null)} 
                className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-[#6B7280]">School ID</div>
                    <div className="mt-1 text-[13px] font-mono text-[#4B5563]">{viewSchool.id}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280]">Name</div>
                    <div className="mt-1 text-[13px] font-medium text-[#1F2937]">{viewSchool.name}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-[#F3F4F6] pt-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {viewSchool.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-[#6B7280]">Email</div>
                        <div className="text-[13px] text-[#1F2937]">{viewSchool.email}</div>
                      </div>
                    </div>
                  )}
                  {viewSchool.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-[#6B7280]">Phone</div>
                        <div className="text-[13px] text-[#1F2937]">{viewSchool.phone}</div>
                      </div>
                    </div>
                  )}
                  {(viewSchool.address || viewSchool.city || viewSchool.state || viewSchool.pincode) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] text-[#6B7280]">Address</div>
                        <div className="text-[13px] text-[#1F2937]">
                          {[viewSchool.address, viewSchool.city, viewSchool.state, viewSchool.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t border-[#F3F4F6] pt-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Additional Information</h3>
                {viewSchool.description ? (
                  <div className="text-[13px] text-[#4B5563] bg-[#F9FAFB] p-3 rounded-md leading-relaxed">
                    {viewSchool.description}
                  </div>
                ) : (
                  <div className="text-[13px] text-[#6B7280]">No additional information available</div>
                )}
              </div>

              {/* Timestamps */}
              <div className="border-t border-[#F3F4F6] pt-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Timestamps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] text-[#6B7280]">Created At</div>
                      <div className="text-[13px] text-[#1F2937]">
                        {new Date(viewSchool.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] text-[#6B7280]">Last Updated</div>
                      <div className="text-[13px] text-[#1F2937]">
                        {new Date(viewSchool.updatedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-[#E5E7EB] bg-white px-6 py-3">
              <button 
                onClick={() => setViewSchool(null)} 
                className="h-8 rounded-md border border-[#E5E7EB] bg-white px-4 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}