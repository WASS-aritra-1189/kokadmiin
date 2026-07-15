import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, TextArea, Toggle } from "@/components/admin/SettingsShell";

export const Route = createFileRoute("/_admin/settings/general")({
  component: GeneralSettings,
  head: () => ({ meta: [{ title: "General settings — BookAdmin" }] }),
});

function GeneralSettings() {
  return (
    <SettingsShell
      title="General"
      description="Workspace identity, regional defaults, and admin behavior across the bookstore backoffice."
    >
      <Section title="Workspace" description="Public name, admin domain, and default language.">
        <Field label="Workspace name">
          <TextInput defaultValue="Sapna Book House" placeholder="Store name" />
        </Field>
        <Field label="Admin URL" hint="Where staff sign in and manage the store.">
          <TextInput defaultValue="admin.sapnabooks.in" />
        </Field>
        <Field label="Default language" cols={2}>
          <Select defaultValue="en-IN">
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">हिन्दी</option>
            <option value="kn-IN">ಕನ್ನಡ</option>
          </Select>
          <Select defaultValue="ltr">
            <option value="ltr">Left-to-right</option>
            <option value="rtl">Right-to-left</option>
          </Select>
        </Field>
      </Section>

      <Section title="Region & time" description="Applies to reports, invoices and scheduled jobs.">
        <Field label="Timezone">
          <Select defaultValue="Asia/Kolkata">
            <option>Asia/Kolkata (IST, UTC+05:30)</option>
            <option>Asia/Dubai (GST, UTC+04:00)</option>
            <option>Asia/Singapore (SGT, UTC+08:00)</option>
            <option>Europe/London (BST, UTC+01:00)</option>
          </Select>
        </Field>
        <Field label="Date format" cols={2}>
          <Select defaultValue="dmy">
            <option value="dmy">DD / MM / YYYY</option>
            <option value="mdy">MM / DD / YYYY</option>
            <option value="ymd">YYYY-MM-DD</option>
          </Select>
          <Select defaultValue="24">
            <option value="24">24-hour clock</option>
            <option value="12">12-hour clock</option>
          </Select>
        </Field>
        <Field label="Week starts on" cols={2}>
          <Select defaultValue="mon">
            <option value="mon">Monday</option>
            <option value="sun">Sunday</option>
          </Select>
          <Select defaultValue="apr">
            <option value="apr">Fiscal year — April</option>
            <option value="jan">Fiscal year — January</option>
          </Select>
        </Field>
      </Section>

      <Section title="Admin behavior" description="Session and productivity defaults for the staff console.">
        <div className="grid gap-2">
          <Toggle label="Auto sign-out after 30 minutes idle" defaultChecked description="Recommended for shared warehouse terminals." />
          <Toggle label="Confirm before bulk destructive actions" defaultChecked description="Adds a typed confirmation for delete / archive over 25 rows." />
          <Toggle label="Enable command palette (⌘K)" defaultChecked description="Fuzzy search across books, orders, customers." />
          <Toggle label="Show onboarding checklist on Dashboard" description="Hides once your team completes setup." />
        </div>
      </Section>

      <Section title="Support contact" description="Shown on invoices, packing slips and transactional emails.">
        <Field label="Support email" cols={2}>
          <TextInput defaultValue="support@sapnabooks.in" />
          <TextInput defaultValue="+91 80 4123 4567" />
        </Field>
        <Field label="Public help note">
          <TextArea defaultValue="Order queries: Mon–Sat, 10:00–19:00 IST. Please quote your order ID." />
        </Field>
      </Section>
    </SettingsShell>
  );
}
