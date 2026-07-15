import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Toggle, Field, Select } from "@/components/admin/SettingsShell";
import { Mail, MessageSquare, Bell, Smartphone } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/notifications")({
  component: NotificationSettings,
  head: () => ({ meta: [{ title: "Notification settings — BookAdmin" }] }),
});

const EVENTS = [
  { key: "order.placed", label: "Order placed", desc: "When a customer completes checkout." },
  { key: "order.paid", label: "Payment received", desc: "Includes UPI, Card, Wallet, EMI confirmations." },
  { key: "order.dispatched", label: "Order dispatched", desc: "Fires when AWB is generated and manifested." },
  { key: "order.delivered", label: "Order delivered", desc: "Carrier POD received." },
  { key: "order.cancelled", label: "Order cancelled", desc: "By customer or admin." },
  { key: "return.requested", label: "Return / refund requested", desc: "Requires support review." },
  { key: "stock.low", label: "Low-stock alert", desc: "When SKU falls below reorder point." },
  { key: "review.new", label: "New product review", desc: "Requires moderation before publish." },
];

function NotificationSettings() {
  return (
    <SettingsShell
      title="Notifications"
      description="Choose which events send notifications, and through which channels."
    >
      <Section title="Channels" description="Enable channels used across the workspace. Individual staff can opt out.">
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle label="Email" defaultChecked description="Transactional + digests. Configured in Email settings." />
          <Toggle label="SMS" defaultChecked description="Uses DLT-approved templates only." />
          <Toggle label="WhatsApp Business" defaultChecked description="Meta template messaging (opt-in)." />
          <Toggle label="Push (mobile admin app)" description="Requires signed in on iOS/Android." />
        </div>
      </Section>

      <Section title="Event matrix" description="Turn channels on or off per event.">
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[#FAFAF9] text-[11px] uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Event</th>
                <ChHead icon={<Mail className="h-3.5 w-3.5" />} label="Email" />
                <ChHead icon={<MessageSquare className="h-3.5 w-3.5" />} label="SMS" />
                <ChHead icon={<Bell className="h-3.5 w-3.5" />} label="WhatsApp" />
                <ChHead icon={<Smartphone className="h-3.5 w-3.5" />} label="Push" />
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((e, i) => (
                <tr key={e.key} className="border-t border-[#F3F4F6]">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-[#111827]">{e.label}</div>
                    <div className="text-[11px] text-[#6B7280]">{e.desc}</div>
                  </td>
                  <ChCell defaultChecked={i !== 6} />
                  <ChCell defaultChecked={i < 5} />
                  <ChCell defaultChecked={i < 4} />
                  <ChCell defaultChecked={false} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Digests" description="Consolidated summaries to reduce noise.">
        <Field label="Daily operations digest to" cols={2}>
          <Select defaultValue="managers">
            <option value="managers">Store managers only</option>
            <option value="all">All staff</option>
            <option value="none">Disabled</option>
          </Select>
          <Select defaultValue="0800">
            <option value="0800">08:00 IST</option>
            <option value="0900">09:00 IST</option>
            <option value="1800">18:00 IST (end of day)</option>
          </Select>
        </Field>
      </Section>
    </SettingsShell>
  );
}

function ChHead({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <th className="w-24 px-3 py-2 text-center font-medium">
      <span className="inline-flex items-center gap-1.5 text-[#374151]">
        {icon}
        {label}
      </span>
    </th>
  );
}

function ChCell({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <td className="px-3 py-2.5 text-center">
      <label className="inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="relative inline-flex h-4.5 w-8 items-center">
          <span className="h-4 w-8 rounded-full bg-[#E5E7EB] transition peer-checked:bg-[#4F46E5]" />
          <span className="absolute left-0.5 h-3 w-3 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
        </span>
      </label>
    </td>
  );
}
