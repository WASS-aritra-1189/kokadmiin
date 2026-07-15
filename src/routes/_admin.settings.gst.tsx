import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";

export const Route = createFileRoute("/_admin/settings/gst")({
  component: GstSettings,
  head: () => ({ meta: [{ title: "GST settings — BookAdmin" }] }),
});

function GstSettings() {
  return (
    <SettingsShell
      title="GST"
      description="GSTIN, HSN defaults, invoice numbering and e-invoicing configuration."
    >
      <Section
        title="GST registration"
        description="Primary GSTIN under which taxable supplies are declared."
        aside={<div className="mt-3"><Badge tone="success">Regular scheme</Badge></div>}
      >
        <Field label="Primary GSTIN" cols={2}>
          <TextInput defaultValue="29AAACS1234K1Z5" />
          <Select defaultValue="regular">
            <option value="regular">Regular</option>
            <option value="composition">Composition</option>
            <option value="casual">Casual taxable person</option>
          </Select>
        </Field>
        <Field label="State of registration" cols={2}>
          <Select defaultValue="KA">
            <option value="KA">Karnataka (29)</option>
            <option value="MH">Maharashtra (27)</option>
            <option value="DL">Delhi (07)</option>
          </Select>
          <TextInput defaultValue="01 Apr 2018" placeholder="Effective from" />
        </Field>
      </Section>

      <Section title="HSN & rate defaults" description="Books have preferential GST treatment — set the defaults here.">
        <Field label="Default HSN for printed books" cols={2}>
          <TextInput defaultValue="4901" />
          <Select defaultValue="0">
            <option value="0">0% — Printed books (HSN 4901)</option>
            <option value="5">5%</option>
            <option value="12">12% — Stationery</option>
            <option value="18">18% — eBooks / digital</option>
          </Select>
        </Field>
        <Field label="Default HSN for eBooks / audiobooks" cols={2}>
          <TextInput defaultValue="998431" />
          <Select defaultValue="18">
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18% — Digital services</option>
          </Select>
        </Field>
        <Field label="Default HSN for stationery / merchandise" cols={2}>
          <TextInput defaultValue="4820" />
          <Select defaultValue="12">
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
          </Select>
        </Field>
      </Section>

      <Section title="Invoice numbering" description="GST-compliant series. Cannot be edited retroactively.">
        <Field label="Invoice series prefix" cols={2}>
          <TextInput defaultValue="SBH/25-26/" />
          <TextInput defaultValue={5421} type="number" placeholder="Next number" />
        </Field>
        <Field label="Credit note prefix" cols={2}>
          <TextInput defaultValue="CN/25-26/" />
          <TextInput defaultValue="DN/25-26/" placeholder="Debit note prefix" />
        </Field>
      </Section>

      <Section title="Compliance" description="e-Invoicing and e-Way bill automation.">
        <div className="grid gap-2">
          <Toggle label="Auto-generate e-Invoice (IRN) above ₹5 Cr turnover" defaultChecked description="Pushes B2B invoices to IRP within 30 seconds of order confirmation." />
          <Toggle label="Auto-generate e-Way bill above ₹50,000" defaultChecked />
          <Toggle label="Reverse charge on unregistered supplier invoices" description="Applies RCM automatically on qualifying POs." />
          <Toggle label="Include place-of-supply on customer invoices" defaultChecked />
        </div>
      </Section>
    </SettingsShell>
  );
}
