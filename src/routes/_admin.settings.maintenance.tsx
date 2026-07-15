import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, TextArea, Select, Toggle, Badge } from "@/components/admin/SettingsShell";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/maintenance")({
  component: MaintenanceSettings,
  head: () => ({ meta: [{ title: "Maintenance — BookAdmin" }] }),
});

function MaintenanceSettings() {
  return (
    <SettingsShell
      title="Maintenance"
      description="Downtime windows, storefront banners and IP allowlisting for maintenance operations."
    >
      <Section
        title="Storefront status"
        description="Take the storefront offline while keeping the admin console live."
        aside={<div className="mt-3"><Badge tone="success">Storefront live</Badge></div>}
      >
        <div className="grid gap-2">
          <Toggle label="Enable maintenance mode" description="Public storefront responds with the notice below. Admin remains reachable." />
          <Toggle label="Pause new order placement" description="Existing carts remain editable, checkout is blocked." />
          <Toggle label="Pause outbound notifications (email / SMS / WhatsApp)" />
        </div>
        <Field label="Customer-facing message">
          <TextArea defaultValue="We're upgrading our systems to serve you better. The store will be back by 06:00 IST tomorrow. Thank you for your patience." />
        </Field>
        <Field label="Expected end" cols={2}>
          <TextInput type="datetime-local" defaultValue="2026-07-04T06:00" />
          <Select defaultValue="banner">
            <option value="banner">Show banner (store still browsable)</option>
            <option value="page">Full-page notice (blocks storefront)</option>
          </Select>
        </Field>
      </Section>

      <Section title="Scheduled downtime" description="Announce planned maintenance windows in advance.">
        <Field label="Window" cols={2}>
          <TextInput type="datetime-local" defaultValue="2026-07-14T02:00" />
          <TextInput type="datetime-local" defaultValue="2026-07-14T05:00" />
        </Field>
        <Field label="Reason (internal)">
          <TextInput defaultValue="Postgres major-version upgrade + search reindex" />
        </Field>
      </Section>

      <Section title="Admin allowlist" description="During maintenance, only these IPs / users can reach admin routes.">
        <Field label="Allowed IPs (CIDR)">
          <TextArea defaultValue={"49.207.0.0/16\n115.248.0.0/16\n192.168.1.0/24"} />
        </Field>
        <div className="grid gap-2">
          <Toggle label="Always allow the admin who enabled maintenance" defaultChecked />
          <Toggle label="Log every admin action during maintenance to System Logs" defaultChecked />
        </div>
      </Section>

      <div className="mt-2 flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-[#B91C1C]" />
        <div>
          <div className="text-[13px] font-semibold text-[#B91C1C]">Danger zone</div>
          <div className="mt-0.5 text-[12px] text-[#7F1D1D]">
            Enabling maintenance mode will halt all storefront traffic and pause revenue. Confirm you have a rollback plan.
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
