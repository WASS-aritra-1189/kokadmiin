import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { streamService } from "@/services/stream.service";

export const Route = createFileRoute("/_admin/catalog/streams")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Streams"
      description="Academic streams like Science, Commerce, Arts used to classify bundles."
      newLabel="New stream"
      fetchFn={streamService.getAll}
      createFn={streamService.create}
      updateFn={streamService.update}
      changeStatusFn={streamService.changeStatus}
      deleteFn={streamService.delete}
      defaultForm={{ name: "", description: "", status: "ACTIVE" }}
      columns={[
        { key: "name", label: "Stream", render: (r: any) => <span className="font-medium">{r.name}</span> },
        { key: "description", label: "Description", render: (r: any) => <span className="text-[#6B7280]">{r.description ?? "—"}</span> },
      ]}
      sheetFields={[
        { key: "name", label: "Stream name", required: true, placeholder: "e.g. Science, Commerce, Arts", full: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Optional description…", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
