import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { courierProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/courier")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Courier APIs"
      description="Connect courier partners for label generation, pickup, tracking and NDR flows."
      providers={courierProviders}
    />
  );
}
