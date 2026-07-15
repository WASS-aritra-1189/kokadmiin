import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { suppliers } from "@/mock/catalog";
import { currency } from "@/mock/data";

export const Route = createFileRoute("/_admin/catalog/suppliers")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Catalog"
      title="Suppliers & vendors"
      description="Wholesale partners you raise purchase orders against. Lead time, GST, rating and outstanding balance."
      rows={suppliers}
      searchKeys={["name", "city", "gstin", "contact"]}
      newLabel="New supplier"
      stats={[
        { label: "Suppliers", value: suppliers.length },
        { label: "Avg lead time", value: `${Math.round(suppliers.reduce((s, x) => s + x.leadDays, 0) / suppliers.length)} days` },
        { label: "Outstanding payable", value: currency(suppliers.reduce((s, x) => s + x.balance, 0)) },
        { label: "Avg rating", value: (suppliers.reduce((s, x) => s + x.rating, 0) / suppliers.length).toFixed(1) + " / 5" },
      ]}
      columns={[
        { key: "name", label: "Supplier", render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-[10px] font-mono text-[#6B7280]">GSTIN {r.gstin}</div>
          </div>
        ) },
        { key: "city", label: "City" },
        { key: "leadDays", label: "Lead time", align: "right", render: (r) => `${r.leadDays} d` },
        { key: "rating", label: "Rating", align: "right", render: (r) => `${r.rating.toFixed(1)} ★` },
        { key: "balance", label: "Balance", align: "right", render: (r) => <span className={r.balance > 100000 ? "font-medium text-[#EF4444]" : "text-[#111827]"}>{currency(r.balance)}</span> },
        { key: "contact", label: "Contact", render: (r) => (
          <div>
            <div>{r.contact}</div>
            <div className="text-[10px] text-[#6B7280]">{r.phone}</div>
          </div>
        ) },
      ]}
      fields={[
        { name: "name", label: "Legal name" },
        { name: "gstin", label: "GSTIN", help: "15-digit GST identification number" },
        { name: "pan", label: "PAN" },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "leadDays", label: "Lead time (days)", type: "number" },
        { name: "paymentTerms", label: "Payment terms", type: "select", options: ["Advance", "Net 15", "Net 30", "Net 45", "Net 60"] },
        { name: "contact", label: "Primary contact" },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email" },
        { name: "address", label: "Registered address", type: "textarea" },
      ]}
    />
  );
}
