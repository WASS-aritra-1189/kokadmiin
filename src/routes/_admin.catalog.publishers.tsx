import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { publishers } from "@/mock/catalog";

export const Route = createFileRoute("/_admin/catalog/publishers")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Catalog"
      title="Publishers"
      description="Publishing houses whose imprints you carry. Contact, imprints, catalog size and status."
      rows={publishers}
      searchKeys={["name", "hq", "contact"]}
      newLabel="New publisher"
      stats={[
        { label: "Publishers", value: publishers.length },
        { label: "Imprints", value: publishers.reduce((s, p) => s + p.imprints, 0) },
        { label: "Total titles", value: publishers.reduce((s, p) => s + p.titles, 0) },
        { label: "Active", value: publishers.filter((p) => p.status === "Active").length },
      ]}
      columns={[
        { key: "name", label: "Publisher", render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-[10px] text-[#6B7280]">HQ · {r.hq}</div>
          </div>
        ) },
        { key: "imprints", label: "Imprints", align: "right" },
        { key: "titles", label: "Titles", align: "right" },
        { key: "contact", label: "Primary contact", render: (r) => (
          <div>
            <div>{r.contact}</div>
            <div className="text-[10px] text-[#6B7280]">{r.email}</div>
          </div>
        ) },
        { key: "status", label: "Status", render: (r) => (
          <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (r.status === "Active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]")}>{r.status}</span>
        ) },
      ]}
      fields={[
        { name: "name", label: "Publisher name" },
        { name: "hq", label: "Headquarters" },
        { name: "founded", label: "Founded", type: "number", placeholder: "1998" },
        { name: "imprints", label: "Number of imprints", type: "number" },
        { name: "contact", label: "Primary contact" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        { name: "website", label: "Website" },
        { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
        { name: "notes", label: "Internal notes", type: "textarea" },
      ]}
    />
  );
}
