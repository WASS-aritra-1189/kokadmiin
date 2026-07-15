import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { accountingProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/accounting")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Accounting"
      description="Sync invoices, credit notes and GST records with your accounting system."
      providers={accountingProviders}
    />
  );
}
