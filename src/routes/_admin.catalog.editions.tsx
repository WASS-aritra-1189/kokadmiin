import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { editions, publishers } from "@/mock/catalog";

export const Route = createFileRoute("/_admin/catalog/editions")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Catalog"
      title="Editions"
      description="Named editions attached to a title — reprints, revised editions, illustrated and anniversary runs."
      rows={editions}
      searchKeys={["name", "publisher", "kind"]}
      newLabel="New edition"
      stats={[
        { label: "Edition templates", value: editions.length },
        { label: "Titles using", value: editions.reduce((s, e) => s + e.titles, 0) },
        { label: "Publishers", value: new Set(editions.map((e) => e.publisher)).size },
        { label: "Latest year", value: Math.max(...editions.map((e) => e.year)) },
      ]}
      columns={[
        { key: "name", label: "Edition", render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-[10px] text-[#6B7280]">{r.publisher}</div>
          </div>
        ) },
        { key: "kind", label: "Kind", render: (r) => <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#4B5563]">{r.kind}</span> },
        { key: "year", label: "Year", align: "right" },
        { key: "titles", label: "Titles", align: "right" },
      ]}
      fields={[
        { name: "name", label: "Edition label" },
        { name: "kind", label: "Kind", type: "select", options: ["First", "Reprint", "Revised", "Illustrated", "Anniversary"] },
        { name: "year", label: "Year of edition", type: "number" },
        { name: "publisher", label: "Publisher", type: "select", options: publishers.map((p) => p.name) },
        { name: "printRun", label: "Print run size", type: "number", placeholder: "5000" },
        { name: "notes", label: "Notes for merchandising", type: "textarea" },
      ]}
    />
  );
}
