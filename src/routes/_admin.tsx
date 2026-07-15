import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bookadmin.token");
      if (!token) throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});
