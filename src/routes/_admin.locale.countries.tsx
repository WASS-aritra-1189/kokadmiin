import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { countryService } from "@/services/locale.service";

export const Route = createFileRoute("/_admin/locale/countries")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Countries"
      description="Countries you sell to or bill from. Controls checkout country dropdowns and shipping availability."
      newLabel="New country"
      fetchFn={countryService.getAll}
      createFn={countryService.create}
      updateFn={countryService.update}
      changeStatusFn={countryService.changeStatus}
      deleteFn={countryService.delete}
      defaultForm={{ name: "", code: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Country",
          render: (r: any) => (
            <div className="flex items-center gap-2">
              {r.code && (
                <div className="flex h-7 w-9 items-center justify-center rounded-md bg-[#F3F4F6] font-mono text-[10px] font-semibold text-[#4B5563]">
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
        { key: "name", label: "Country name", required: true, placeholder: "e.g. India", full: true },
        { key: "code", label: "Country code", placeholder: "e.g. IN", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
