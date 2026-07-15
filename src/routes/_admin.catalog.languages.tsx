import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { languageService } from "@/services/language.service";

export const Route = createFileRoute("/_admin/catalog/languages")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Languages"
      description="Languages a title can be published in. Drives storefront filters and downstream typography rules."
      newLabel="New language"
      fetchFn={languageService.getAll}
      createFn={languageService.create}
      updateFn={languageService.update}
      changeStatusFn={languageService.changeStatus}
      deleteFn={languageService.delete}
      defaultForm={{ name: "", code: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Language",
          render: (r: any) => <span className="font-medium">{r.name}</span>,
        },
        {
          key: "code",
          label: "Code",
          render: (r: any) => (
            <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-[#4B5563]">
              {r.code ?? "—"}
            </span>
          ),
        },
      ]}
      sheetFields={[
        { key: "name", label: "Language name", required: true, placeholder: "e.g. English, Hindi", full: true },
        { key: "code", label: "Language code", placeholder: "e.g. en, hi", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
