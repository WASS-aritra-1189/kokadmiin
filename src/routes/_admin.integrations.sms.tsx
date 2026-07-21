import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { configService, mapSmsConfigToProvider } from "@/services/config.service";

export const Route = createFileRoute("/_admin/integrations/sms")({ component: Page });

function Page() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["smsConfig"],
    queryFn: configService.getSmsConfig,
  });

  const providers = mapSmsConfigToProvider(config ?? null);

  return (
    <IntegrationsPage
      group="Integrations"
      title="SMS Gateway"
      description="Provider for OTPs, order updates and marketing SMS. Ensure DLT templates are registered for India."
      providers={providers}
      isLoading={isLoading}
      configEndpoint="sms-gateway"
      configService={configService}
    />
  );
}
