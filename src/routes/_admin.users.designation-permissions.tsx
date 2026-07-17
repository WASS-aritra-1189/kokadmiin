import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { designationService, type Designation } from "@/services/designation.service";
import { menuService, type Menu } from "@/services/menu.service";
import { designationPermissionService, type MenuItem } from "@/services/permission.service";

export const Route = createFileRoute("/_admin/users/designation-permissions")({ component: DesignationPermissionsPage });

const LIMIT = 50;

function DesignationPermissionsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedDesignation, setSelectedDesignation] = useState<string>("");
  const [permissions, setPermissions] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // All permission types available
  const permissionTypes = ["CREATE", "READ", "UPDATE", "DELETE"];

  // Load designations on mount
  useEffect(() => {
    (async () => {
      try {
        const [desRes, menuRes] = await Promise.all([
          designationService.getAll({ page: 1, limit: 100 }),
          menuService.getAll({ page: 1, limit: 100 }),
        ]);
        setDesignations(desRes?.data ?? []);
        setMenus(menuRes?.data ?? []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    })();
  }, []);

  // Load permissions when designation is selected
  useEffect(() => {
    if (!selectedDesignation) {
      setPermissions([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await designationPermissionService.getByDesignation(selectedDesignation);
        // Backend returns { designationId, menus: [{ menu, permissions: [{ id, name, status }] }] }
        const menuData = res?.menus ?? res?.data?.menus ?? [];
        
        // Build permissions map from response
        const permsMap = new Map<string, Map<string, { id: string; status: boolean }>>();
        for (const m of menuData) {
          const permMap = new Map<string, { id: string; status: boolean }>();
          for (const p of m.permissions ?? []) {
            permMap.set(p.name, { id: p.id, status: p.status });
          }
          permsMap.set(m.menu, permMap);
        }

        // Build MenuItems array from available menus
        const items: MenuItem[] = menus
          .filter(m => m.status === "ACTIVE")
          .map(m => ({
            menu: m.name,
            permissions: permissionTypes.map(pt => {
              const existing = permsMap.get(m.name)?.get(pt);
              return {
                id: existing?.id || "",  // Empty string for new, real UUID for existing
                name: pt,
                status: existing?.status ?? false,
              };
            }),
          }));

        setPermissions(items);
      } catch (err) {
        console.error("Failed to load permissions", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDesignation, menus]);

  const handlePermissionChange = (menuIndex: number, permName: string, checked: boolean) => {
    setPermissions(prev => {
      const updated = [...prev];
      const permIndex = updated[menuIndex].permissions.findIndex(p => p.name === permName);
      if (permIndex >= 0) {
        updated[menuIndex] = {
          ...updated[menuIndex],
          permissions: updated[menuIndex].permissions.map((p, i) =>
            i === permIndex ? { ...p, status: checked } : p
          ),
        };
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedDesignation) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Build list of permissions to send - needs valid UUIDs and enabled status
      const permList: { id: string; status: boolean }[] = [];
      
      for (const menuItem of permissions) {
        for (const p of menuItem.permissions) {
          // Only include enabled permissions that have valid UUID ids
          if (p.status && p.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)) {
            permList.push({ id: p.id, status: true });
          }
        }
      }

      console.log('Saving permissions:', permList);
      await designationPermissionService.updatePermissions(selectedDesignation, permList);
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
        <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Designation Permissions</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Assign menu permissions to designations. Staff will inherit these permissions based on their designation.</p>
      </div>

      {/* Designation Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-[12px] font-medium text-[#374151]">Select Designation</label>
        <select
          value={selectedDesignation}
          onChange={(e) => setSelectedDesignation(e.target.value)}
          className="h-10 w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]"
        >
          <option value="">-- Select a designation --</option>
          {designations.filter(d => d.status === "ACTIVE").map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>}
      {success && <div className="mb-4 rounded-2xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-[12px] text-[#065F46]">{success}</div>}

      {selectedDesignation && (
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
            <div className="text-[12px] font-semibold text-[#374151]">
              Permissions for: {designations.find(d => d.id === selectedDesignation)?.name}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-semibold text-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-[#6B7280]">Loading permissions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] table-auto">
                <thead className="bg-[#FAFAFB] text-[10px] uppercase tracking-wider text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3 text-left">Menu</th>
                    <th className="px-4 py-3 text-center">Create</th>
                    <th className="px-4 py-3 text-center">Read</th>
                    <th className="px-4 py-3 text-center">Update</th>
                    <th className="px-4 py-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((menuItem, menuIndex) => (
                    <tr key={menuItem.menu} className="border-t border-[#F3F4F6]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{menuItem.menu}</td>
                      {permissionTypes.map(permName => {
                        const perm = menuItem.permissions.find(p => p.name === permName);
                        return (
                          <td key={permName} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm?.status ?? false}
                              onChange={(e) => handlePermissionChange(menuIndex, permName, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {permissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[#6B7280]">
                        No menus available. Please create menus first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}