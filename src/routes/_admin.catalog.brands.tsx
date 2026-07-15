import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { brands } from "@/mock/catalog";

export const Route = createFileRoute("/_admin/catalog/brands")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Catalog"
      title="Brands"
      description="In-house imprints and third-party brand lines merchandised across the storefront."
      rows={brands}
      searchKeys={["name", "segment"]}
      newLabel="New brand"
      stats={[
        { label: "Brands", value: brands.length },
        { label: "Active", value: brands.filter((b) => b.status === "Active").length },
        { label: "Titles carried", value: brands.reduce((s, b) => s + b.titles, 0) },
        { label: "Segments covered", value: new Set(brands.map((b) => b.segment)).size },
      ]}
      columns={[
        { key: "name", label: "Brand", render: (r) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md" style={{ background: r.color }} />
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-[10px] text-[#6B7280]">{r.segment}</div>
            </div>
          </div>
        ) },
        { key: "titles", label: "Titles", align: "right" },
        { key: "status", label: "Status", render: (r) => (
          <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (r.status === "Active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#4B5563]")}>{r.status}</span>
        ) },
      ]}
      fields={[
        { name: "name", label: "Brand name" },
        { name: "segment", label: "Segment", placeholder: "Fiction reprints" },
        { name: "color", label: "Accent colour", type: "color" },
        { name: "website", label: "Website" },
        { name: "status", label: "Status", type: "select", options: ["Active", "Draft"] },
        { name: "tagline", label: "Tagline", full: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
