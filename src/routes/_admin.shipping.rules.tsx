import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";
export const Route = createFileRoute("/_admin/shipping/rules")({ component: () => <ModulePlaceholder title="Rules" group="Shipping" /> });
