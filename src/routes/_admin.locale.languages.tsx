import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { localeLanguageService } from "@/services/locale.service";

export const Route = createFileRoute("/_admin/locale/languages")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Languages"
      description="Storefront and admin languages. Set the default and enable translations customers can switch between."
      newLabel="New language"
      fetchFn={localeLanguageService.getAll}
      createFn={localeLanguageService.create}
      updateFn={localeLanguageService.update}
      changeStatusFn={localeLanguageService.changeStatus}
      deleteFn={localeLanguageService.delete}
      defaultForm={{ name: "", code: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Language",
          render: (r: any) => (
            <div className="flex items-center gap-2">
              {r.code && (
                <div className="flex h-7 w-9 items-center justify-center rounded-md bg-[#F3F4F6] font-mono text-[10px] font-semibold uppercase text-[#4B5563]">
                  {r.code}
                </div>
              )}
              <span className="font-medium">{r.name}</span>
            </div>
          ),
        },
        {
          key: "code",
          label: "Code",
          render: (r: any) => (
            <span className="font-mono text-[11px] text-[#4B5563]">{r.code ?? "—"}</span>
          ),
        },
      ]}
      sheetFields={[
        { key: "name", label: "Language name", required: true, placeholder: "e.g. Hindi", full: true },
        { key: "code", label: "Language code", placeholder: "e.g. hi", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
