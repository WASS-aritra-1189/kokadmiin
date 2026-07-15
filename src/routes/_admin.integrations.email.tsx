import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { emailProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/email")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Email API"
      description="Transactional email provider used for order confirmations, shipping updates and password resets."
      providers={emailProviders}
    />
  );
}
