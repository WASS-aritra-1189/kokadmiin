import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { analyticsProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/analytics")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Google Analytics"
      description="Web analytics and product event tracking. Enable e-commerce events for revenue and funnel reporting."
      providers={analyticsProviders}
    />
  );
}
