import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { staffService, type StaffDetail } from "@/services/staff.service";
import { menuService, type Menu } from "@/services/menu.service";
import { designationService, type Designation } from "@/services/designation.service";
import { accountPermissionService, designationPermissionService, type MenuItem } from "@/services/permission.service";

export const Route = createFileRoute("/_admin/users/staff-permissions")({ component: StaffPermissionsPage });

function StaffPermissionsPage() {
  const [staffList, setStaffList] = useState<StaffDetail[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffDetail | null>(null);
  const [permissions, setPermissions] = useState<MenuItem[]>([]);
  const [inheritedPermissions, setInheritedPermissions] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const permissionTypes = ["CREATE", "READ", "UPDATE", "DELETE"];

  useEffect(() => {
    (async () => {
      try {
        const [staffRes, menuRes, desigRes] = await Promise.all([
          staffService.getAll({ page: 1, limit: 100 }),
          menuService.getAll({ page: 1, limit: 100 }),
          designationService.getAll({ page: 1, limit: 100 }),
        ]);
        setStaffList(staffRes?.data ?? []);
        setMenus(menuRes?.data ?? []);
        setDesignations(desigRes?.data ?? []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedStaff) {
      setPermissions([]);
      setInheritedPermissions([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await accountPermissionService.getByAccount(selectedStaff.accountId);
        // Backend returns { accountId, menus: [{ menu, permissions: [{ id, permissionId, name, status }] }] }
        const menuData = res?.menus ?? res?.data?.menus ?? [];
        
        console.log("API Response menuData:", JSON.stringify(menuData, null, 2));
        
        // Build permissions map from response - MUST include permissionId!
        const permsMap = new Map<string, Map<string, { id: string; permissionId: string; status: boolean }>>();
        for (const m of menuData) {
          const permMap = new Map<string, { id: string; permissionId: string; status: boolean }>();
          for (const p of m.permissions ?? []) {
            console.log("Permission from API:", JSON.stringify(p));
            permMap.set(p.name, { id: p.id, permissionId: p.permissionId, status: p.status });
          }
          permsMap.set(m.menu, permMap);
        }

        // Build MenuItems from available menus
        const items: MenuItem[] = menus
          .filter(m => m.status === "ACTIVE")
          .map(m => ({
            menu: m.name,
            permissions: permissionTypes.map(pt => {
              const existing = permsMap.get(m.name)?.get(pt);
              console.log("Existing for", m.name, pt, ":", existing);
              return {
                id: existing?.id || "",
                permissionId: existing?.permissionId || "",
                name: pt,
                status: existing?.status ?? false,
              };
            }),
          }));

        setPermissions(items);

        // Load inherited permissions from designation
        if (selectedStaff.designationId) {
          try {
            const desigRes = await designationPermissionService.getByDesignation(selectedStaff.designationId);
            const desigMenuData = desigRes?.menus ?? desigRes?.data?.menus ?? [];
            
            const inheritedMap = new Map<string, Map<string, { id: string; status: boolean }>>();
            for (const m of desigMenuData) {
              const permMap = new Map<string, { id: string; status: boolean }>();
              for (const p of m.permissions ?? []) {
                permMap.set(p.name, { id: p.id, status: p.status });
              }
              inheritedMap.set(m.menu, permMap);
            }

            setInheritedPermissions(menus
              .filter(m => m.status === "ACTIVE")
              .map(m => ({
                menu: m.name,
                permissions: permissionTypes.map(pt => ({
                  id: inheritedMap.get(m.name)?.get(pt)?.id ?? "",
                  name: pt,
                  status: inheritedMap.get(m.name)?.get(pt)?.status ?? false,
                })),
              }))
            );
          } catch (e) {
            console.error("Failed to load inherited permissions", e);
          }
        }
      } catch (err) {
        console.error("Failed to load staff permissions", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedStaff, menus]);

  const handlePermissionChange = (menuIndex: number, permName: string, checked: boolean) => {
    setPermissions(prev => prev.map((item, i) => 
      i === menuIndex ? { ...item, permissions: item.permissions.map(p => p.name === permName ? { ...p, status: checked } : p) } : item
    ));
  };

  const handleSave = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Only include enabled permissions with valid UUIDs
      console.log("permissions state before save:", JSON.stringify(permissions, null, 2));
      
      const permList = permissions
        .flatMap(menuItem => 
          menuItem.permissions
            .filter(p => p.status && p.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id))
            .map(p => {
              console.log("Processing permission:", JSON.stringify(p));
              return {
                menuId: menus.find(m => m.name === menuItem.menu)?.id,
                permissionId: p.permissionId || p.id,
                status: p.status,
              };
            })
        )
        .filter(p => p.menuId && p.permissionId);

      console.log("Final permList:", JSON.stringify(permList, null, 2));

      // Add accountId to each permission
      const permListWithAccount = permList.map(p => ({
        ...p,
        accountId: selectedStaff.accountId,
      }));
      
      console.log("Final permList with accountId:", JSON.stringify(permListWithAccount, null, 2));

      await accountPermissionService.update(permListWithAccount);
      setSuccess("Permissions saved successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Users & Admin</div>
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Staff Permissions</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Manage individual staff permissions. Staff inherit permissions from their designation automatically.</p>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-[12px] font-medium text-[#374151]">Select Staff Member</label>
        <select
          value={selectedStaff?.id ?? ""}
          onChange={(e) => { setSelectedStaff(staffList.find(s => s.id === e.target.value) || null); setSuccess(null); setError(null); }}
          className="h-10 w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]"
        >
          <option value="">-- Select a staff member --</option>
          {staffList.map(s => (
            <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {designations.find(d => d.id === s.designationId)?.name || "No designation"}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>}
      {success && <div className="mb-4 rounded-2xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-[12px] text-[#065F46]">{success}</div>}

      {selectedStaff && (
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
            <div>
              <div className="text-[12px] font-semibold text-[#374151]">Permissions for: {selectedStaff.firstName} {selectedStaff.lastName}</div>
              <div className="text-[11px] text-[#6B7280]">Designation: {designations.find(d => d.id === selectedStaff.designationId)?.name || "None"}</div>
            </div>
            <button onClick={handleSave} disabled={saving || loading} className="inline-flex h-9 items-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-semibold text-white disabled:opacity-60">
              <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>

          {loading ? <div className="px-5 py-10 text-center text-[#6B7280]">Loading permissions...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] table-auto">
                <thead className="bg-[#FAFAFB] text-[10px] uppercase tracking-wider text-[#6B7280]">
                  <tr><th className="px-4 py-3 text-left">Menu</th><th className="px-4 py-3 text-center">Create</th><th className="px-4 py-3 text-center">Read</th><th className="px-4 py-3 text-center">Update</th><th className="px-4 py-3 text-center">Delete</th></tr>
                </thead>
                <tbody>
                  {permissions.map((menuItem, menuIndex) => (
                    <tr key={menuItem.menu} className="border-t border-[#F3F4F6]">
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        {menuItem.menu}
                        {inheritedPermissions[menuIndex]?.permissions.some(p => p.status) && <span className="ml-2 text-[10px] text-green-600">(Inherited)</span>}
                      </td>
                      {permissionTypes.map(permName => {
                        const perm = menuItem.permissions.find(p => p.name === permName);
                        const isInherited = inheritedPermissions[menuIndex]?.permissions.find(p => p.name === permName)?.status;
                        return (
                          <td key={permName} className="px-4 py-3 text-center">
                            <input type="checkbox" checked={perm?.status ?? false} onChange={(e) => handlePermissionChange(menuIndex, permName, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#4F46E5]" />
                            {isInherited && <div className="text-[10px] text-gray-400">Inherited</div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {permissions.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#6B7280]">No menus available.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}