import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";

export const Route = createFileRoute("/_admin/settings/store")({
  component: StoreSettings,
  head: () => ({ meta: [{ title: "Store settings — BookAdmin" }] }),
});

function StoreSettings() {
  return (
    <SettingsShell
      title="Store"
      description="Storefront behavior, catalog defaults and checkout policies."
    >
      <Section title="Storefront" description="Public-facing bookstore configuration.">
        <Field label="Storefront URL" cols={2}>
          <TextInput defaultValue="www.sapnabooks.in" />
          <Select defaultValue="published">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="password">Password-protected</option>
          </Select>
        </Field>
        <Field label="Homepage template">
          <Select defaultValue="featured">
            <option value="featured">Featured collections + carousel</option>
            <option value="editorial">Editorial magazine layout</option>
            <option value="minimal">Minimal grid</option>
          </Select>
        </Field>
      </Section>

      <Section title="Catalog defaults" description="Applied to new books unless overridden per SKU.">
        <Field label="Default condition" cols={2}>
          <Select defaultValue="new">
            <option value="new">New</option>
            <option value="used-good">Used — Good</option>
            <option value="used-acceptable">Used — Acceptable</option>
          </Select>
          <Select defaultValue="in-stock">
            <option>Track stock (in-stock)</option>
            <option>Track stock (pre-order)</option>
            <option>Do not track</option>
          </Select>
        </Field>
        <Field label="Low-stock threshold" cols={2}>
          <TextInput type="number" defaultValue={5} />
          <TextInput type="number" defaultValue={50} placeholder="Reorder point" />
        </Field>
      </Section>

      <Section
        title="Checkout"
        description="Rules that apply to guest and account checkouts."
        aside={
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="info">Guest allowed</Badge>
            <Badge tone="success">OTP verified</Badge>
          </div>
        }
      >
        <div className="grid gap-2">
          <Toggle label="Allow guest checkout" defaultChecked description="Customers can purchase without creating an account." />
          <Toggle label="Require phone OTP verification" defaultChecked description="Sends a 6-digit code before payment." />
          <Toggle label="Allow partial payment (advance + COD)" description="Useful for high-value textbooks." />
          <Toggle label="Show estimated delivery on cart" defaultChecked />
        </div>
        <Field label="Minimum order value" cols={2}>
          <TextInput defaultValue="₹ 199" />
          <TextInput defaultValue="₹ 499" placeholder="Free-shipping threshold" />
        </Field>
      </Section>

      <Section title="Returns & refunds" description="Default return window and restock policy.">
        <Field label="Return window" cols={2}>
          <Select defaultValue="7">
            <option value="0">No returns</option>
            <option value="7">7 days</option>
            <option value="15">15 days</option>
            <option value="30">30 days</option>
          </Select>
          <Select defaultValue="wallet">
            <option value="original">Refund to original payment</option>
            <option value="wallet">Store wallet</option>
            <option value="either">Customer chooses</option>
          </Select>
        </Field>
      </Section>
    </SettingsShell>
  );
}
