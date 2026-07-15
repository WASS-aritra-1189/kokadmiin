import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";
import { CreditCard, Wallet, Banknote, Landmark, Smartphone } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/payments")({
  component: PaymentSettings,
  head: () => ({ meta: [{ title: "Payment settings — BookAdmin" }] }),
});

const GATEWAYS = [
  { key: "razorpay", name: "Razorpay", icon: CreditCard, status: "connected", fee: "2.0% + ₹2", methods: "UPI, Cards, NB, Wallets" },
  { key: "cashfree", name: "Cashfree", icon: Wallet, status: "connected", fee: "1.9% + ₹2", methods: "UPI, Cards, EMI" },
  { key: "phonepe", name: "PhonePe Business", icon: Smartphone, status: "test", fee: "0.9%", methods: "UPI Intent" },
  { key: "cod", name: "Cash on Delivery", icon: Banknote, status: "connected", fee: "₹30 flat", methods: "Handled by courier" },
  { key: "bank", name: "Bank Transfer / NEFT", icon: Landmark, status: "disabled", fee: "—", methods: "Manual reconcile" },
] as const;

function PaymentSettings() {
  return (
    <SettingsShell
      title="Payments"
      description="Configure gateways, COD rules and refund behavior. Fees are applied at checkout."
    >
      <Section title="Enabled gateways" description="Toggle providers and manage credentials.">
        <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
          {GATEWAYS.map((g) => {
            const Icon = g.icon;
            const tone = g.status === "connected" ? "success" : g.status === "test" ? "warn" : "muted";
            return (
              <div key={g.key} className="flex items-center gap-4 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F3F4F6] text-[#374151]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-medium">{g.name}</div>
                    <Badge tone={tone as never}>{g.status}</Badge>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{g.methods} · MDR {g.fee}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[11.5px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                    Manage
                  </button>
                  <Toggle label="" defaultChecked={g.status !== "disabled"} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Cash on Delivery" description="Rules for COD orders across pincodes.">
        <Field label="COD availability" cols={2}>
          <Select defaultValue="pin">
            <option value="all">All serviceable pincodes</option>
            <option value="pin">Selected pincodes only</option>
            <option value="off">Disabled globally</option>
          </Select>
          <TextInput defaultValue="₹ 2,500" placeholder="Max COD order value" />
        </Field>
        <Field label="COD handling fee" cols={2}>
          <TextInput defaultValue="₹ 30" />
          <Select defaultValue="add">
            <option value="add">Add to order total</option>
            <option value="waive">Waive above ₹999</option>
            <option value="hide">Hide from customer</option>
          </Select>
        </Field>
      </Section>

      <Section title="Refunds" description="How refunds are issued after cancellation or return approval.">
        <div className="grid gap-2">
          <Toggle label="Auto-refund on order cancellation before dispatch" defaultChecked />
          <Toggle label="Refund shipping fee on full-order returns" description="Excludes reverse-pickup charge." />
          <Toggle label="Offer store credit as default (customer can opt out)" description="Improves cashflow — credit expires in 12 months." />
        </div>
        <Field label="Refund SLA" cols={2}>
          <Select defaultValue="3">
            <option value="1">1 business day</option>
            <option value="3">3 business days</option>
            <option value="7">7 business days</option>
          </Select>
          <Select defaultValue="original">
            <option value="original">Original payment method</option>
            <option value="wallet">Store wallet</option>
          </Select>
        </Field>
      </Section>
    </SettingsShell>
  );
}
