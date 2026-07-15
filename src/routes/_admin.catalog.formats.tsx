import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { formats } from "@/mock/catalog";

export const Route = createFileRoute("/_admin/catalog/formats")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Catalog"
      title="Formats"
      description="Physical and digital delivery formats. Controls shipping weight, ISBN requirement and taxability."
      rows={formats}
      searchKeys={["name", "kind"]}
      newLabel="New format"
      stats={[
        { label: "Formats", value: formats.length },
        { label: "Physical", value: formats.filter((f) => f.kind === "Physical").length },
        { label: "Digital", value: formats.filter((f) => f.kind === "Digital").length },
        { label: "Titles across formats", value: formats.reduce((s, f) => s + f.titles, 0).toLocaleString("en-IN") },
      ]}
      columns={[
        { key: "name", label: "Format", render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-[10px] font-mono text-[#6B7280]">{r.id}</div>
          </div>
        ) },
        { key: "kind", label: "Kind", render: (r) => (
          <span className={"rounded-md px-2 py-0.5 text-[10px] font-medium " + (r.kind === "Physical" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#DBEAFE] text-[#1E40AF]")}>{r.kind}</span>
        ) },
        { key: "weight", label: "Weight" },
        { key: "hasIsbn", label: "ISBN", render: (r) => r.hasIsbn ? "Required" : "Optional" },
        { key: "taxable", label: "GST", render: (r) => r.taxable ? "Taxable" : "Exempt" },
        { key: "titles", label: "Titles", align: "right" },
      ]}
      fields={[
        { name: "name", label: "Format name" },
        { name: "kind", label: "Kind", type: "select", options: ["Physical", "Digital"] },
        { name: "weight", label: "Typical weight", placeholder: "300–450 g" },
        { name: "dims", label: "Dimensions (LxWxH)", placeholder: "20 × 13 × 2 cm" },
        { name: "hasIsbn", label: "ISBN required", type: "toggle" },
        { name: "taxable", label: "GST applicable", type: "toggle" },
        { name: "hsn", label: "Default HSN code", placeholder: "4901" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  );
}
