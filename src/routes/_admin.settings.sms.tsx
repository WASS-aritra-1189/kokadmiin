import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";

export const Route = createFileRoute("/_admin/settings/sms")({
  component: SmsSettings,
  head: () => ({ meta: [{ title: "SMS settings — BookAdmin" }] }),
});

function SmsSettings() {
  return (
    <SettingsShell
      title="SMS"
      description="Transactional SMS provider, sender IDs and DLT compliance for India."
    >
      <Section
        title="Provider"
        description="Preferred SMS gateway. DLT registration is mandatory for Indian numbers."
        aside={<div className="mt-3"><Badge tone="success">DLT approved</Badge></div>}
      >
        <Field label="Gateway">
          <Select defaultValue="msg91">
            <option value="msg91">MSG91</option>
            <option value="gupshup">Gupshup</option>
            <option value="kaleyra">Kaleyra</option>
            <option value="textlocal">Textlocal</option>
            <option value="twilio">Twilio</option>
          </Select>
        </Field>
        <Field label="Auth key / API secret" cols={2}>
          <TextInput defaultValue="425678A••••••••••••••••" />
          <TextInput defaultValue="ap-south-1" placeholder="Region" />
        </Field>
      </Section>

      <Section title="DLT registration" description="Details registered on Jio TRAI / Airtel DLT portal.">
        <Field label="Principal Entity ID" cols={2}>
          <TextInput defaultValue="1101234567890123" placeholder="PE ID" />
          <TextInput defaultValue="SAPNAB" placeholder="Sender ID (Header)" />
        </Field>
        <Field label="Default template ID" cols={2}>
          <TextInput defaultValue="1707162345678901234" placeholder="Order confirmation" />
          <TextInput defaultValue="1707162345678901235" placeholder="OTP" />
        </Field>
      </Section>

      <Section title="Sending rules" description="Guardrails to keep spam complaints and cost low.">
        <div className="grid gap-2">
          <Toggle label="Respect Do-Not-Disturb (DND) for promotional SMS" defaultChecked />
          <Toggle label="Send promotional SMS only 10:00–19:00 IST" defaultChecked />
          <Toggle label="Fallback to WhatsApp when SMS undelivered" defaultChecked description="Uses the same template if opted-in." />
          <Toggle label="Log every SMS to System Logs" defaultChecked />
        </div>
        <Field label="Monthly spend cap" cols={2}>
          <TextInput defaultValue="₹ 25,000" />
          <Select defaultValue="warn">
            <option value="warn">Warn admins at 80%</option>
            <option value="halt">Halt promotional sends at 100%</option>
            <option value="both">Warn and then halt</option>
          </Select>
        </Field>
      </Section>

      <Section title="Test send" description="Trigger a live SMS to verify header and template.">
        <Field label="Recipient / template" cols={2}>
          <TextInput defaultValue="+91 " placeholder="Mobile number" />
          <Select defaultValue="order">
            <option value="order">Order confirmation</option>
            <option value="dispatch">Dispatch notification</option>
            <option value="otp">OTP</option>
          </Select>
        </Field>
        <div>
          <button className="h-9 rounded-md bg-[#111827] px-4 text-[12px] font-medium text-white hover:bg-[#1F2937]">
            Send test SMS
          </button>
        </div>
      </Section>
    </SettingsShell>
  );
}
