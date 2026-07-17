import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return <Outlet />;
}

// index page content moved to src/routes/_admin.dashboard.index.tsx
// index page content moved to src/routes/_admin.dashboard.index.tsx
