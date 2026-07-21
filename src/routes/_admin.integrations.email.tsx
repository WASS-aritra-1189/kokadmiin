import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { configService, mapEmailConfigToProvider } from "@/services/config.service";

export const Route = createFileRoute("/_admin/integrations/email")({ component: Page });

function Page() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["emailConfig"],
    queryFn: configService.getEmailConfig,
  });

  const providers = mapEmailConfigToProvider(config ?? null);

  return (
    <IntegrationsPage
      group="Integrations"
      title="Email API"
      description="Transactional email provider used for order confirmations, shipping updates and password resets."
      providers={providers}
      isLoading={isLoading}
      configEndpoint="email"
      configService={configService}
    />
  );
}
