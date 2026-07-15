import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { authorService } from "@/services/author.service";

export const Route = createFileRoute("/_admin/catalog/authors")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

function Page() {
  return (
    <CatalogApiPage
      title="Authors"
      description="Author profiles powering author pages, filter facets and book attribution."
      newLabel="New author"
      fetchFn={authorService.getAll}
      createFn={authorService.create}
      updateFn={authorService.update}
      changeStatusFn={authorService.changeStatus}
      deleteFn={authorService.delete}
      defaultForm={{ name: "", bio: "", email: "", phone: "", nationality: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Author",
          render: (r: any) => (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#C7D2FE] text-[11px] font-semibold text-[#4F46E5]">
                {r.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-[10px] text-[#6B7280]">{r.nationality ?? "—"}</div>
              </div>
            </div>
          ),
        },
        { key: "email", label: "Email", render: (r: any) => <span className="text-[#6B7280]">{r.email ?? "—"}</span> },
        { key: "phone", label: "Phone", render: (r: any) => <span className="text-[#6B7280]">{r.phone ?? "—"}</span> },
        { key: "bookCount", label: "Books", align: "right", render: (r: any) => <span className="tabular-nums">{r.bookCount ?? 0}</span> },
      ]}
      sheetFields={[
        { key: "name", label: "Full name", required: true, placeholder: "e.g. Ruskin Bond", full: true },
        { key: "email", label: "Email", type: "email", placeholder: "author@example.com" },
        { key: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
        { key: "nationality", label: "Nationality", placeholder: "e.g. Indian" },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        { key: "bio", label: "Biography", type: "textarea", placeholder: "Short author biography…", full: true },
      ]}
    />
  );
}
