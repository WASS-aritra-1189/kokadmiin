import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { timezones } from "@/mock/localization";

export const Route = createFileRoute("/_admin/locale/timezones")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Localization"
      title="Time Zones"
      description="Time zones used for scheduled campaigns, order timestamps, and staff working hours."
      rows={timezones}
      searchKeys={["name", "tz", "country", "offset"]}
      newLabel="New time zone"
      stats={[
        { label: "Time zones", value: timezones.length },
        { label: "Enabled", value: timezones.filter((t) => t.enabled).length },
        { label: "Default", value: timezones.find((t) => t.isDefault)?.offset ?? "—" },
        { label: "Countries", value: new Set(timezones.map((t) => t.country)).size },
      ]}
      columns={[
        { key: "name", label: "Time zone", render: (r) => (
          <div>
            <div className="font-medium">{r.name} {r.isDefault && <span className="ml-1 rounded bg-[#EEF2FF] px-1 py-0.5 text-[9px] font-medium text-[#4F46E5]">Default</span>}</div>
            <div className="font-mono text-[10px] text-[#6B7280]">{r.tz}</div>
          </div>
        ) },
        { key: "offset", label: "UTC offset", render: (r) => <span className="font-mono text-[11px]">{r.offset}</span> },
        { key: "country", label: "Country" },
        { key: "enabled", label: "Status", render: (r) => (
          <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (r.enabled ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]")}>{r.enabled ? "Enabled" : "Disabled"}</span>
        ) },
      ]}
      fields={[
        { name: "name", label: "Display name" },
        { name: "tz", label: "IANA identifier", placeholder: "Asia/Kolkata" },
        { name: "offset", label: "UTC offset", placeholder: "+05:30" },
        { name: "country", label: "Country", placeholder: "India" },
        { name: "enabled", label: "Enabled", type: "toggle" },
        { name: "isDefault", label: "Set as default", type: "toggle" },
      ]}
    />
  );
}
