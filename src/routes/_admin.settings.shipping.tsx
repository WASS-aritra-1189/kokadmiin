import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/shipping")({
  component: ShippingSettings,
  head: () => ({ meta: [{ title: "Shipping settings — BookAdmin" }] }),
});

const CARRIERS = [
  { name: "Delhivery", tier: "Surface + Express", cover: "27,000+ pincodes", status: "primary" },
  { name: "Blue Dart", tier: "Air Express", cover: "Metro + Tier-1", status: "connected" },
  { name: "DTDC", tier: "Surface", cover: "18,000+ pincodes", status: "connected" },
  { name: "India Post BPO", tier: "Registered / Speed Post", cover: "All-India", status: "backup" },
  { name: "Shiprocket", tier: "Aggregator", cover: "Auto-routed", status: "connected" },
] as const;

function ShippingSettings() {
  return (
    <SettingsShell
      title="Shipping"
      description="Carriers, packaging defaults, rate cards and delivery SLAs."
    >
      <Section title="Carriers" description="Connected couriers and their coverage.">
        <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
          {CARRIERS.map((c) => (
            <div key={c.name} className="flex items-center gap-4 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EEF2FF] text-[#4F46E5]">
                <Truck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[13px] font-medium">{c.name}</div>
                  <Badge tone={c.status === "primary" ? "info" : "success"}>{c.status}</Badge>
                </div>
                <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{c.tier} · {c.cover}</div>
              </div>
              <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[11.5px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                Rate card
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Routing rules" description="How orders are assigned to a carrier automatically.">
        <Field label="Primary strategy">
          <Select defaultValue="cheapest">
            <option value="cheapest">Cheapest serviceable</option>
            <option value="fastest">Fastest delivery ETA</option>
            <option value="preferred">Prefer Delhivery, fallback DTDC</option>
            <option value="manual">Manual assignment per order</option>
          </Select>
        </Field>
        <div className="grid gap-2">
          <Toggle label="Route Prime / same-day orders to Blue Dart Air" defaultChecked />
          <Toggle label="Fallback to India Post for non-serviceable pincodes" defaultChecked />
          <Toggle label="Split shipment when items are across warehouses" defaultChecked />
        </div>
      </Section>

      <Section title="Packaging" description="Default packaging profiles used to compute volumetric weight.">
        <Field label="Default box" cols={2}>
          <Select defaultValue="std">
            <option value="poly">Poly mailer (up to 1 book)</option>
            <option value="std">Standard book box (up to 3 books)</option>
            <option value="lg">Large carton (up to 8 books)</option>
          </Select>
          <TextInput defaultValue="80 g" placeholder="Packaging weight" />
        </Field>
        <Field label="Dimensions (cm)" cols={2}>
          <TextInput defaultValue="24 × 16 × 5" placeholder="L × W × H" />
          <TextInput defaultValue="5000 g/m³" placeholder="Volumetric divisor" />
        </Field>
      </Section>

      <Section title="Customer promises" description="Displayed on product and cart pages.">
        <Field label="Standard delivery" cols={2}>
          <TextInput defaultValue="3–5 business days" />
          <TextInput defaultValue="1–2 business days" placeholder="Express delivery" />
        </Field>
        <div className="grid gap-2">
          <Toggle label="Show ETA on product page based on pincode" defaultChecked />
          <Toggle label="Auto-share tracking link via WhatsApp on dispatch" defaultChecked />
        </div>
      </Section>
    </SettingsShell>
  );
}
