import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/admin/CatalogTable";
import { seriesList, authors } from "@/mock/catalog";

export const Route = createFileRoute("/_admin/catalog/series")({ component: Page });

function Page() {
  return (
    <CatalogPage
      group="Catalog"
      title="Book series"
      description="Multi-book series with ordered volumes, shared cover treatment and reading order."
      rows={seriesList}
      searchKeys={["name", "author"]}
      newLabel="New series"
      stats={[
        { label: "Series", value: seriesList.length },
        { label: "Ongoing", value: seriesList.filter((s) => s.ongoing).length },
        { label: "Total volumes", value: seriesList.reduce((s, x) => s + x.books, 0) },
        { label: "Avg volumes / series", value: (seriesList.reduce((s, x) => s + x.books, 0) / seriesList.length).toFixed(1) },
      ]}
      columns={[
        { key: "name", label: "Series", render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-[10px] text-[#6B7280]">Latest · {r.latest}</div>
          </div>
        ) },
        { key: "author", label: "Author" },
        { key: "books", label: "Volumes", align: "right" },
        { key: "ongoing", label: "Status", render: (r) => (
          <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (r.ongoing ? "bg-[#DBEAFE] text-[#1E40AF]" : "bg-[#F3F4F6] text-[#4B5563]")}>{r.ongoing ? "Ongoing" : "Completed"}</span>
        ) },
      ]}
      fields={[
        { name: "name", label: "Series name" },
        { name: "author", label: "Author", type: "select", options: authors.map((a) => a.name) },
        { name: "planned", label: "Planned volumes", type: "number" },
        { name: "readingOrder", label: "Reading order", type: "select", options: ["Chronological", "Publication order", "Standalone"] },
        { name: "ongoing", label: "Ongoing", type: "toggle" },
        { name: "description", label: "Series description", type: "textarea" },
      ]}
    />
  );
}
