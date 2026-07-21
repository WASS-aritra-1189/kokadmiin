import { api } from "@/lib/axios";

const wrap = (r: any) => r.data?.data ?? r.data;

// Types for menu-item permissions
export type MenuItem = {
  menu: string;
  permissions: { id: string; permissionId?: string; name: string; status: boolean }[];
};

// Types for designation permissions
export type DesignationPermission = {
  id: string;
  menuId: string;
  permissionId: string;
  designationId: string;
  status: boolean;
  menu?: { id: string; name: string; title: string };
  permission?: { id: string; name: string };
};

// Get all permissions for a designation
export const designationPermissionService = {
  getByDesignation: (designationId: string) =>
    api.get(`/designations/permissions/${designationId}`).then(wrap),

  updatePermissions: (designationId: string, permissions: { id: string; status: boolean }[]) =>
    api.patch(`/designations/permissions/${designationId}`, { permissions }).then(wrap),
};

// Get all permissions for an account (staff)
export const accountPermissionService = {
  getByAccount: (accountId: string) =>
    api.get(`/account-permissions/${accountId}`).then(wrap),

  getCurrentUser: () =>
    api.get("/account-permissions/my-permissions").then(wrap),

  update: (permissions: { menuId: string; permissionId: string; status: boolean }[]) =>
    api.patch("/account-permissions", { permissions }).then(wrap),
};