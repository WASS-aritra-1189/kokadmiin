import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, TextArea, Select, Badge } from "@/components/admin/SettingsShell";
import { Building2, MapPin } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/company")({
  component: CompanySettings,
  head: () => ({ meta: [{ title: "Company — BookAdmin" }] }),
});

function CompanySettings() {
  return (
    <SettingsShell
      title="Company"
      description="Legal entity, registered address and compliance identifiers used on invoices and shipping labels."
    >
      <Section title="Legal entity" description="Appears on every tax invoice and courier manifest.">
        <Field label="Legal name">
          <TextInput defaultValue="Sapna Book House Pvt. Ltd." />
        </Field>
        <Field label="Brand / trading name" cols={2}>
          <TextInput defaultValue="Sapna Books" />
          <Select defaultValue="pvt">
            <option value="prop">Sole proprietorship</option>
            <option value="llp">LLP</option>
            <option value="pvt">Private Limited</option>
            <option value="ltd">Public Limited</option>
          </Select>
        </Field>
        <Field label="PAN / CIN" cols={2}>
          <TextInput defaultValue="AAACS1234K" placeholder="PAN" />
          <TextInput defaultValue="U22110KA1998PTC023456" placeholder="CIN" />
        </Field>
      </Section>

      <Section title="Registered address" description="Head office address printed on legal documents.">
        <Field label="Street">
          <TextArea defaultValue="No. 3, Gandhi Nagar, Sadar Patrappa Road" />
        </Field>
        <Field label="City / State / PIN" cols={2}>
          <TextInput defaultValue="Bengaluru" />
          <TextInput defaultValue="Karnataka — 560002" />
        </Field>
      </Section>

      <Section
        title="Warehouses"
        description="Ship-from locations. Add or edit warehouses in Inventory → Warehouses."
        aside={<div className="mt-3"><Badge tone="info">4 active</Badge></div>}
      >
        <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
          {[
            { name: "Bengaluru — Main", addr: "Peenya Industrial Area, Phase 2, Bengaluru 560058", gstin: "29AAACS1234K1Z5", primary: true },
            { name: "Mumbai — West", addr: "Andheri MIDC, Marol, Mumbai 400093", gstin: "27AAACS1234K1Z3" },
            { name: "Delhi NCR", addr: "Sector 63, Noida, UP 201301", gstin: "09AAACS1234K1Z1" },
            { name: "Kolkata East", addr: "Salt Lake Sector V, Kolkata 700091", gstin: "19AAACS1234K1Z8" },
          ].map((w) => (
            <div key={w.name} className="flex items-start justify-between gap-4 p-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#4F46E5]">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-medium">{w.name}</div>
                    {w.primary && <Badge tone="success">Primary</Badge>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-[#6B7280]">
                    <MapPin className="h-3 w-3" /> {w.addr}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#9CA3AF]">GSTIN {w.gstin}</div>
                </div>
              </div>
              <button className="text-[11.5px] font-medium text-[#4F46E5] hover:underline">Edit</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Signing authority" description="Printed as authorized signatory on tax invoices.">
        <Field label="Name / designation" cols={2}>
          <TextInput defaultValue="Nitin R. Shanbhag" />
          <TextInput defaultValue="Director — Finance" />
        </Field>
      </Section>
    </SettingsShell>
  );
}
