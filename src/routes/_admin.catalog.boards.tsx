import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { boardService } from "@/services/board.service";

export const Route = createFileRoute("/_admin/catalog/boards")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Boards"
      description="Academic boards like CBSE, ICSE, State Board used to classify textbooks."
      newLabel="New board"
      fetchFn={boardService.getAll}
      createFn={boardService.create}
      updateFn={boardService.update}
      changeStatusFn={boardService.changeStatus}
      deleteFn={boardService.delete}
      defaultForm={{ name: "", description: "", status: "ACTIVE" }}
      columns={[
        { key: "name", label: "Board", render: (r: any) => <span className="font-medium">{r.name}</span> },
        { key: "description", label: "Description", render: (r: any) => <span className="text-[#6B7280]">{r.description ?? "—"}</span> },
      ]}
      sheetFields={[
        { key: "name", label: "Board name", required: true, placeholder: "e.g. CBSE, ICSE, State Board", full: true },
        { key: "description", label: "Description", type: "textarea", placeholder: "Optional description…", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
