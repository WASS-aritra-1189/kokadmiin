import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { whatsappProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/whatsapp")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="WhatsApp API"
      description="Business Solution Provider for template messages, order updates and abandoned-cart recovery."
      providers={whatsappProviders}
    />
  );
}
