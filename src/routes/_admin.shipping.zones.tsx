import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";
export const Route = createFileRoute("/_admin/shipping/zones")({ component: () => <ModulePlaceholder title="Zones" group="Shipping" /> });
