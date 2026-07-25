import { createFileRoute } from "@tanstack/react-router";
import { CatalogApiPage } from "@/components/admin/CatalogApiPage";
import { publisherService } from "@/services/publisher.service";

export const Route = createFileRoute("/_admin/catalog/publishers")({ component: Page });

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVE", label: "Deactive" },
];

// Wrapper: First upload image, then update publisher logo with the path
const handleLogoUpload = async (id: string, file: File) => {
  const path = await publisherService.uploadImage(file);
  return publisherService.updateLogo(id, path);
};

function Page() {
  return (
    <CatalogApiPage
      title="Publishers"
      description="Publishing houses whose imprints you carry. Contact, imprints, catalog size and status."
      newLabel="New publisher"
      fetchFn={publisherService.getAll}
      createFn={publisherService.create}
      updateFn={publisherService.update}
      changeStatusFn={publisherService.changeStatus}
      deleteFn={publisherService.delete}
      uploadProfileImageFn={handleLogoUpload}
      profileImageField="logo"
      defaultForm={{ name: "", description: "", email: "", phone: "", website: "", address: "", status: "ACTIVE" }}
      columns={[
        {
          key: "name",
          label: "Publisher",
          render: (r: any) => (
            <div className="flex items-center gap-2">
              {r.logo ? (
                <img src={r.logo} alt={r.name} className="h-8 w-8 flex-shrink-0 rounded object-cover" />
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-[#EEF2FF] to-[#C7D2FE] text-[11px] font-semibold text-[#4F46E5]">
                  {r.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-[10px] text-[#6B7280]">{r.address ?? "—"}</div>
              </div>
            </div>
          ),
        },
        { key: "email", label: "Email", render: (r: any) => <span className="text-[#6B7280]">{r.email ?? "—"}</span> },
        { key: "phone", label: "Phone", render: (r: any) => <span className="text-[#6B7280]">{r.phone ?? "—"}</span> },
        { key: "website", label: "Website", render: (r: any) => <span className="text-[#6B7280]">{r.website ?? "—"}</span> },
      ]}
      sheetFields={[
        { key: "name", label: "Publisher name", required: true, placeholder: "e.g. Penguin Random House", full: true },
        { key: "email", label: "Email", type: "email", placeholder: "contact@publisher.com" },
        { key: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
        { key: "website", label: "Website", placeholder: "https://publisher.com" },
        { key: "address", label: "Address", placeholder: "Publisher headquarters address", full: true },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        { key: "description", label: "Description", type: "textarea", placeholder: "Brief description of the publisher…", full: true },
      ]}
    />
  );
}