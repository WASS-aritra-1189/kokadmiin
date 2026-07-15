import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { pixelProviders } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/pixel")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Advertising Pixels"
      description="Track conversions from Meta, TikTok, Pinterest and Snap. Prefer Conversions API for iOS accuracy."
      providers={pixelProviders}
    />
  );
}
