import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";

export const Route = createFileRoute("/_admin/settings/currency")({
  component: CurrencySettings,
  head: () => ({ meta: [{ title: "Currency settings — BookAdmin" }] }),
});

const CURRENCIES = [
  { code: "INR", name: "Indian Rupee", rate: 1, base: true },
  { code: "USD", name: "US Dollar", rate: 0.012, base: false },
  { code: "AED", name: "UAE Dirham", rate: 0.044, base: false },
  { code: "GBP", name: "Pound Sterling", rate: 0.0095, base: false },
  { code: "SGD", name: "Singapore Dollar", rate: 0.016, base: false },
];

function CurrencySettings() {
  return (
    <SettingsShell
      title="Currency"
      description="Base currency, display rounding and FX for international customers."
    >
      <Section title="Base & display" description="Base currency is the one you're accounted in.">
        <Field label="Base currency" cols={2}>
          <Select defaultValue="INR">
            <option value="INR">₹ INR — Indian Rupee</option>
            <option value="USD">$ USD — US Dollar</option>
            <option value="AED">د.إ AED — UAE Dirham</option>
          </Select>
          <Select defaultValue="₹ 1,299.00">
            <option>₹ 1,299.00</option>
            <option>₹ 1,299</option>
            <option>INR 1,299.00</option>
            <option>1,299.00 ₹</option>
          </Select>
        </Field>
        <Field label="Rounding rule">
          <Select defaultValue="none">
            <option value="none">No rounding — show exact</option>
            <option value="nearest">Round to nearest ₹1</option>
            <option value="up">Round up to next ₹5</option>
            <option value="psy">Psychological (₹.99 endings)</option>
          </Select>
        </Field>
      </Section>

      <Section
        title="Multi-currency"
        description="Show prices to international customers in their local currency."
        aside={<div className="mt-3"><Badge tone="info">Live FX from RBI reference</Badge></div>}
      >
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[#FAFAF9] text-[11px] uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Currency</th>
                <th className="px-3 py-2 text-left font-medium">Code</th>
                <th className="px-3 py-2 text-right font-medium">FX (per ₹1)</th>
                <th className="px-3 py-2 text-center font-medium">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {CURRENCIES.map((c) => (
                <tr key={c.code} className="border-t border-[#F3F4F6]">
                  <td className="px-3 py-2.5 font-medium">
                    {c.name}
                    {c.base && <Badge tone="success">Base</Badge>}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[#374151]">{c.code}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{c.rate.toFixed(4)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <input type="checkbox" defaultChecked={!c.base ? c.code === "USD" || c.code === "AED" : true} disabled={c.base} className="h-4 w-4 rounded border-[#D1D5DB] text-[#4F46E5]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="FX refresh" description="How often we pull reference rates.">
        <Field label="Frequency" cols={2}>
          <Select defaultValue="daily">
            <option value="hourly">Hourly</option>
            <option value="daily">Daily at 09:30 IST</option>
            <option value="manual">Manual only</option>
          </Select>
          <TextInput defaultValue="+ 1.5% margin" placeholder="FX buffer" />
        </Field>
        <div className="grid gap-2">
          <Toggle label="Auto-switch storefront currency by visitor IP" defaultChecked />
          <Toggle label="Charge in customer's currency (else INR)" defaultChecked />
        </div>
      </Section>
    </SettingsShell>
  );
}
