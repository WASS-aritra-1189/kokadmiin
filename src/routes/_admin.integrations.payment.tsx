import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { configService, mapPaymentConfigToProvider } from "@/services/config.service";

export const Route = createFileRoute("/_admin/integrations/payment")({ component: Page });

function Page() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["paymentConfig"],
    queryFn: configService.getPaymentConfig,
  });

  const providers = mapPaymentConfigToProvider(config ?? null);

  return (
    <IntegrationsPage
      group="Integrations"
      title="Payment APIs"
      description="Connect payment gateways used at checkout. Live keys settle real money — verify in test mode first."
      providers={providers}
      isLoading={isLoading}
      configEndpoint="payment-gateway"
      configService={configService}
    />
  );
}
