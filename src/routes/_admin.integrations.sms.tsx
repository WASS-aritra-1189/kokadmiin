import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { smsProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/sms")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="SMS Gateway"
      description="Provider for OTPs, order updates and marketing SMS. Ensure DLT templates are registered for India."
      providers={smsProviders}
    />
  );
}
