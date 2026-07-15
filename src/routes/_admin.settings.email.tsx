import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/email")({
  component: EmailSettings,
  head: () => ({ meta: [{ title: "Email settings — BookAdmin" }] }),
});

function EmailSettings() {
  return (
    <SettingsShell
      title="Email"
      description="SMTP relay, sending identity and deliverability configuration."
    >
      <Section title="Sending identity" description="How your emails appear in the customer inbox.">
        <Field label="From name" cols={2}>
          <TextInput defaultValue="Sapna Books" />
          <TextInput defaultValue="orders@sapnabooks.in" placeholder="From email" />
        </Field>
        <Field label="Reply-to" cols={2}>
          <TextInput defaultValue="support@sapnabooks.in" />
          <TextInput defaultValue="no-reply-bounces@sapnabooks.in" placeholder="Bounce address" />
        </Field>
      </Section>

      <Section
        title="SMTP relay"
        description="Outbound provider. We recommend a dedicated transactional provider."
        aside={<div className="mt-3"><Badge tone="success">Verified · 24h uptime 99.98%</Badge></div>}
      >
        <Field label="Provider">
          <Select defaultValue="ses">
            <option value="ses">Amazon SES</option>
            <option value="sendgrid">SendGrid</option>
            <option value="postmark">Postmark</option>
            <option value="msg91">MSG91 Email</option>
            <option value="custom">Custom SMTP</option>
          </Select>
        </Field>
        <Field label="Host / Port" cols={2}>
          <TextInput defaultValue="email-smtp.ap-south-1.amazonaws.com" />
          <TextInput defaultValue={587} type="number" />
        </Field>
        <Field label="Username / Password" cols={2}>
          <TextInput defaultValue="AKIAIOSFODNN7EXAMPLE" />
          <TextInput type="password" defaultValue="••••••••••••" />
        </Field>
        <Field label="Encryption" cols={2}>
          <Select defaultValue="tls">
            <option value="tls">STARTTLS</option>
            <option value="ssl">SSL/TLS</option>
            <option value="none">None (not recommended)</option>
          </Select>
          <button className="h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
            Send test email
          </button>
        </Field>
      </Section>

      <Section title="Deliverability" description="DNS records that prove ownership of sapnabooks.in.">
        <div className="grid gap-2">
          {[
            { name: "SPF", value: "v=spf1 include:amazonses.com ~all", ok: true },
            { name: "DKIM", value: "sapna._domainkey.sapnabooks.in", ok: true },
            { name: "DMARC", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@sapnabooks.in", ok: true },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[12.5px] font-semibold">{r.name}</div>
                  {r.ok && <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />}
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-[#6B7280]">{r.value}</div>
              </div>
              <button className="text-[11.5px] font-medium text-[#4F46E5] hover:underline">Verify</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Behavior" description="Global rules for transactional and marketing email.">
        <div className="grid gap-2">
          <Toggle label="Track opens & clicks" defaultChecked description="Adds tracking pixel and rewrites links." />
          <Toggle label="Suppress marketing to unsubscribed contacts" defaultChecked />
          <Toggle label="Retry failed sends up to 3 times over 2 hours" defaultChecked />
          <Toggle label="Send preview to staging inbox before campaign blast" />
        </div>
      </Section>
    </SettingsShell>
  );
}
