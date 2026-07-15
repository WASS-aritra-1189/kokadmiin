import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { gtmProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/gtm")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Google Tag Manager"
      description="Container-based tag management for marketing and analytics scripts, including server-side tagging."
      providers={gtmProviders}
    />
  );
}
