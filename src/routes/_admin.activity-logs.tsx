import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Filter, Clock, User, Monitor, Globe, FileText } from "lucide-react";
import { activityLogsService, type ActivityLogItem, type ActivityLogsQuery } from "@/services/activity-logs.service";

export const Route = createFileRoute("/_admin/activity-logs")({
  component: ActivityLogsPage,
});

const LIMIT = 20;

const MODULE_OPTIONS = [
  { value: "", label: "All Modules" },
  { value: "AUTH", label: "Auth" },
  { value: "BOOKS", label: "Books" },
  { value: "ORDERS", label: "Orders" },
  { value: "CUSTOMERS", label: "Customers" },
  { value: "CATEGORY", label: "Categories" },
  { value: "AUTHOR", label: "Authors" },
  { value: "PUBLISHER", label: "Publishers" },
  { value: "SCHOOL", label: "Schools" },
  { value: "BUNCH", label: "Bunches" },
  { value: "COUPON", label: "Coupons" },
  { value: "PAYMENT", label: "Payments" },
  { value: "SHIPPING", label: "Shipping" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "READ", label: "Read" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
];

function ActivityLogsPage() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<ActivityLogsQuery>({
    page: 1,
    limit: LIMIT,
  });

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await activityLogsService.getAll({ ...filters, page: p, limit: LIMIT });
      setItems(res?.data?.data ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const setFilter = (key: keyof ActivityLogsQuery, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const actionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-[#DCFCE7] text-[#166534]",
      READ: "bg-[#DBEAFE] text-[#1D4ED8]",
      UPDATE: "bg-[#FEF3C7] text-[#B45309]",
      DELETE: "bg-[#FEE2E2] text-[#991B1B]",
      LOGIN: "bg-[#E0E7FF] text-[#4338CA]",
      LOGOUT: "bg-[#F3F4F6] text-[#4B5563]",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[action] || "bg-gray-100 text-gray-600"}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Activity Logs</div>
      <div className="mt-1">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Activity Logs</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">
          Track and monitor all user activities across the system.
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mt-5 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by IP address..."
            value={filters.ipAddress || ""}
            onChange={(e) => setFilter("ipAddress", e.target.value)}
            className="h-10 w-full rounded-full border border-[#E5E7EB] bg-white pl-10 pr-4 text-[12px] outline-none focus:border-[#4F46E5]"
          />
        </div>

        <select
          value={filters.module || ""}
          onChange={(e) => setFilter("module", e.target.value)}
          className="h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-[12px] outline-none focus:border-[#4F46E5]"
        >
          {MODULE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.action || ""}
          onChange={(e) => setFilter("action", e.target.value)}
          className="h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-[12px] outline-none focus:border-[#4F46E5]"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => setFilter("startDate", e.target.value)}
          className="h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-[12px] outline-none focus:border-[#4F46E5]"
        />

        <input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => setFilter("endDate", e.target.value)}
          className="h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-[12px] outline-none focus:border-[#4F46E5]"
        />

        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#1F2937]"
        >
          <Filter className="h-4 w-4" /> Filter
        </button>
      </form>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] table-auto">
            <thead className="bg-[#FAFAFB] text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Module</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">IP Address</th>
                <th className="px-4 py-3 text-left">Device</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#6B7280]">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#6B7280]">No activity logs found.</td></tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#6B7280]">
                      <Clock className="h-3.5 w-3.5" />
                      {item.accessTime ? new Date(item.accessTime).toLocaleString("en-IN", { 
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" 
                      }) : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      <span className="text-[#111827]">{item.loginId || item.accountId?.slice(0, 8) || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-1 text-[11px] font-medium text-[#374151]">
                      {item.module || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{actionBadge(item.action || "")}</td>
                  <td className="px-4 py-3 text-[#6B7280] max-w-xs truncate">{item.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#6B7280]">
                      <Globe className="h-3.5 w-3.5" />
                      {item.ipAddress || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#6B7280]">
                      <Monitor className="h-3.5 w-3.5" />
                      {item.device || "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F3F4F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-[#6B7280]">Page {page} of {totalPages} • {total} total records</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}