import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { currencies } from "@/mock/localization";

export const Route = createFileRoute("/_admin/locale/currencies")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Localization"
      title="Currencies"
      description="Currencies accepted at checkout. The base currency drives accounting; others convert at the stored rate."
      rows={currencies}
      searchKeys={["name", "code", "symbol"]}
      newLabel="New currency"
      stats={[
        { label: "Currencies", value: currencies.length },
        { label: "Enabled", value: currencies.filter((c) => c.enabled).length },
        { label: "Base", value: currencies.find((c) => c.isBase)?.code ?? "—" },
        { label: "Avg. decimals", value: (currencies.reduce((s, c) => s + c.decimals, 0) / currencies.length).toFixed(1) },
      ]}
      columns={[
        { key: "code", label: "Currency", render: (r) => (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-9 items-center justify-center rounded-md bg-[#F3F4F6] text-[12px]">{r.symbol}</div>
            <div>
              <div className="font-medium">{r.name} {r.isBase && <span className="ml-1 rounded bg-[#EEF2FF] px-1 py-0.5 text-[9px] font-medium text-[#4F46E5]">Base</span>}</div>
              <div className="font-mono text-[10px] text-[#6B7280]">{r.code}</div>
            </div>
          </div>
        ) },
        { key: "rate", label: "Rate", align: "right", render: (r) => <span className="font-mono">{r.rate.toFixed(4)}</span> },
        { key: "decimals", label: "Decimals", align: "right" },
        { key: "enabled", label: "Status", render: (r) => (
          <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (r.enabled ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]")}>{r.enabled ? "Enabled" : "Disabled"}</span>
        ) },
      ]}
      fields={[
        { name: "name", label: "Currency name" },
        { name: "code", label: "ISO 4217 code", placeholder: "INR" },
        { name: "symbol", label: "Symbol", placeholder: "₹" },
        { name: "rate", label: "Rate to base", type: "number", placeholder: "1.0000" },
        { name: "decimals", label: "Decimal places", type: "number", placeholder: "2" },
        { name: "enabled", label: "Enabled at checkout", type: "toggle" },
        { name: "isBase", label: "Set as base currency", type: "toggle" },
      ]}
    />
  );
}
