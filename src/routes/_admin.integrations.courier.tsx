import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { configService, mapCourierConfigToProvider } from "@/services/config.service";

export const Route = createFileRoute("/_admin/integrations/courier")({ component: Page });

function Page() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["courierConfig"],
    queryFn: configService.getCourierConfig,
  });

  const providers = mapCourierConfigToProvider(config ?? null);

  return (
    <IntegrationsPage
      group="Integrations"
      title="Courier APIs"
      description="Connect courier partners for label generation, pickup, tracking and NDR flows."
      providers={providers}
      isLoading={isLoading}
      configEndpoint="courier-gateway"
      configService={configService}
    />
  );
}
