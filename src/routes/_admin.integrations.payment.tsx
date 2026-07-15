import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { paymentProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/payment")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Payment APIs"
      description="Connect payment gateways used at checkout. Live keys settle real money — verify in test mode first."
      providers={paymentProviders}
    />
  );
}
