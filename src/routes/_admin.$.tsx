import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";
import { findNavLabel } from "@/components/admin/nav-config";

export const Route = createFileRoute("/_admin/$")({
  component: SplatPage,
});

function SplatPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const match = findNavLabel(pathname);
  const fallback = pathname.replace(/^\//, "").split("/").pop() || "Module";
  const pretty = fallback
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
  return (
    <ModulePlaceholder
      title={match?.label ?? pretty}
      group={match?.group ?? "Admin"}
    />
  );
}
