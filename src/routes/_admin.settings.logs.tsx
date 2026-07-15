import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Badge } from "@/components/admin/SettingsShell";
import { Download, Filter, Search } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/logs")({
  component: SystemLogs,
  head: () => ({ meta: [{ title: "System logs — BookAdmin" }] }),
});

type Sev = "info" | "warn" | "error";
type Row = { time: string; actor: string; area: string; action: string; ip: string; sev: Sev };

const LOGS: Row[] = [
  { time: "2026-07-03 14:32:11", actor: "priya.k@sapnabooks.in", area: "Auth", action: "Signed in via Google Workspace", ip: "49.207.213.4", sev: "info" },
  { time: "2026-07-03 14:29:47", actor: "farhan.i@sapnabooks.in", area: "Inventory", action: "Adjusted stock for SKU BK-98421 by −4", ip: "115.248.10.9", sev: "info" },
  { time: "2026-07-03 14:24:02", actor: "system", area: "Backup", action: "Nightly incremental completed (12 MB)", ip: "—", sev: "info" },
  { time: "2026-07-03 14:12:55", actor: "rahul.d@sapnabooks.in", area: "Orders", action: "Cancelled order #SBH-25-45129 with refund to wallet", ip: "202.83.19.44", sev: "warn" },
  { time: "2026-07-03 13:58:19", actor: "webhook", area: "Payments", action: "Razorpay signature mismatch on order #SBH-25-45118", ip: "35.244.44.12", sev: "error" },
  { time: "2026-07-03 13:44:00", actor: "kavya.m@sapnabooks.in", area: "Returns", action: "Approved return R-11298 with reverse pickup", ip: "49.207.213.7", sev: "info" },
  { time: "2026-07-03 13:22:41", actor: "system", area: "Shipping", action: "Delhivery API 502 — retried and succeeded", ip: "—", sev: "warn" },
  { time: "2026-07-03 12:58:03", actor: "priya.k@sapnabooks.in", area: "Settings", action: "Updated GST invoice series prefix to SBH/25-26/", ip: "49.207.213.4", sev: "info" },
  { time: "2026-07-03 12:41:19", actor: "system", area: "Auth", action: "3 failed sign-in attempts for admin@sapnabooks.in — rate-limited", ip: "203.0.113.9", sev: "error" },
];

const SEV: Record<Sev, "info" | "warn" | "danger"> = { info: "info", warn: "warn", error: "danger" };

function SystemLogs() {
  return (
    <SettingsShell
      title="System Logs"
      description="Immutable audit trail of admin actions, webhooks and background jobs. Retained for 12 months."
      actions={
        <>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <StatCard label="Events (24h)" value="1,284" trend="+8.2%" />
        <StatCard label="Admin actions" value="312" trend="+3.1%" />
        <StatCard label="Warnings" value="27" trend="−12%" tone="warn" />
        <StatCard label="Errors" value="4" trend="−50%" tone="danger" />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            placeholder="Search by user, action, IP or order ID…"
            className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4F46E5]"
          />
        </div>
        <select className="h-9 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12.5px] outline-none">
          <option>All severity</option>
          <option>Info</option>
          <option>Warn</option>
          <option>Error</option>
        </select>
        <select className="h-9 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12.5px] outline-none">
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#FAFAF9] text-[11px] uppercase tracking-wider text-[#6B7280]">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Time</th>
              <th className="px-3 py-2 text-left font-medium">Sev</th>
              <th className="px-3 py-2 text-left font-medium">Actor</th>
              <th className="px-3 py-2 text-left font-medium">Area</th>
              <th className="px-3 py-2 text-left font-medium">Action</th>
              <th className="px-3 py-2 text-left font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {LOGS.map((l, i) => (
              <tr key={i} className="border-t border-[#F3F4F6] hover:bg-[#FAFAF9]">
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-[#6B7280]">{l.time}</td>
                <td className="px-3 py-2.5"><Badge tone={SEV[l.sev]}>{l.sev}</Badge></td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-[#111827]">{l.actor}</td>
                <td className="whitespace-nowrap px-3 py-2.5"><Badge tone="muted">{l.area}</Badge></td>
                <td className="px-3 py-2.5 text-[#374151]">{l.action}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-[#6B7280]">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11.5px] text-[#6B7280]">
          <div>Showing 9 of 1,284 events</div>
          <div className="flex items-center gap-1">
            <button className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 hover:bg-[#F9FAFB]">Prev</button>
            <button className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 hover:bg-[#F9FAFB]">Next</button>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}

function StatCard({
  label, value, trend, tone = "info",
}: { label: string; value: string; trend: string; tone?: "info" | "warn" | "danger" }) {
  const trendColor = tone === "warn" ? "text-[#B45309]" : tone === "danger" ? "text-[#B91C1C]" : "text-[#047857]";
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-[22px] font-semibold text-[#111827]">{value}</div>
        <div className={`text-[11.5px] font-medium ${trendColor}`}>{trend}</div>
      </div>
    </div>
  );
}
