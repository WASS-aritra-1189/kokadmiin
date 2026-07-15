import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";
import { webhookEndpoints } from "@/mock/integrations";

export const Route = createFileRoute("/_admin/integrations/webhooks")({ component: Page });

function Page() {
  return (
    <IntegrationsPage
      group="Integrations"
      title="Webhooks"
      description="Outgoing webhooks fired for orders, refunds, inventory and customer events. Every request is HMAC-signed."
      providers={webhookEndpoints}
      extras={
        <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-5">
          <div className="text-[13px] font-semibold">Signature verification</div>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            Every request includes an <span className="font-mono">X-Kokbooks-Signature</span> header. Compute
            <span className="font-mono"> HMAC-SHA256(body, secret)</span> and compare — reject on mismatch.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-[#0F172A] p-3 font-mono text-[11px] leading-relaxed text-[#E5E7EB]">{`POST /your/endpoint HTTP/1.1
Content-Type: application/json
X-Kokbooks-Event: order.created
X-Kokbooks-Delivery: 8f2c…
X-Kokbooks-Signature: sha256=9b1d…

{ "id": "ord_10245", "total": 1499.00, "items": [ … ] }`}</pre>
        </div>
      }
    />
  );
}
