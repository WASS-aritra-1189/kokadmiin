import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { genreService } from "@/services/genre.service";

export const Route = createFileRoute("/_admin/catalog/genres")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Genres"
      description="Fine-grained groupings used for storefront browse widgets and recommendations."
      newLabel="New genre"
      fetchFn={genreService.getAll}
      createFn={genreService.create}
      updateFn={genreService.update}
      changeStatusFn={genreService.changeStatus}
      deleteFn={genreService.delete}
      defaultForm={{ name: "", description: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Genre",
          render: (r: any) => <span className="font-medium">{r.name}</span>,
        },
        {
          key: "description",
          label: "Description",
          render: (r: any) => (
            <span className="text-[#6B7280] truncate max-w-xs block">{r.description ?? "—"}</span>
          ),
        },
      ]}
      sheetFields={[
        { key: "name", label: "Genre name", required: true, placeholder: "e.g. Fiction, Science, History", full: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Optional description…", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
