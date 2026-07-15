import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { warehouses } from "@/mock/data";
import { Building2, MapPin, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_admin/inventory/warehouses")({ component: WarehousesPage });

type W = { id: string; name: string; city: string; onHand: number; address?: string; manager?: string; phone?: string; gstin?: string; capacity?: number; type?: string };

const extra: Record<string, Partial<W>> = {
  "WH-MUM": { address: "Plot 14, MIDC Andheri East, Mumbai 400093", manager: "R. Bhaskar", phone: "+91 98110 20000", gstin: "27AAECB4455L1Z1", capacity: 12000, type: "Owned" },
  "WH-DEL": { address: "Khasra 42, Bawana Industrial Area, Delhi 110039", manager: "S. Basu", phone: "+91 98300 21100", gstin: "07AABCA1234E1Z5", capacity: 8000, type: "Owned" },
  "WH-BLR": { address: "Plot 7, Bommasandra Phase 2, Bengaluru 560099", manager: "M. Iyer", phone: "+91 98400 33221", gstin: "29AAECD3311M1Z4", capacity: 6000, type: "3PL — Delhivery" },
  "WH-CHE": { address: "Ambattur Industrial Estate, Chennai 600058", manager: "V. Reddy", phone: "+91 98480 11221", gstin: "33AAACS9012F1Z2", capacity: 4500, type: "3PL — Blue Dart" },
};

export function WarehousesPage() {
  const [editing, setEditing] = useState<Partial<W> | null>(null);
  const rows: W[] = warehouses.map((w) => ({ ...w, ...extra[w.id] }));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Inventory</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Warehouses</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Physical fulfilment locations with their own GSTIN, manager and stock capacity.</p>
        </div>
        <button onClick={() => setEditing({})} className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white"><Plus className="h-3.5 w-3.5" />New warehouse</button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {rows.map((w) => {
          const used = Math.round((w.onHand / (w.capacity ?? 10000)) * 100);
          return (
            <div key={w.id} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EEF2FF] text-[#4F46E5]"><Building2 className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[14px] font-semibold">{w.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6B7280]"><MapPin className="h-3 w-3" />{w.address}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 font-mono text-[#4B5563]">{w.id}</span>
                      <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[#4B5563]">{w.type}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setEditing(w)} className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium">Edit</button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
                <div><div className="text-[#6B7280]">On hand</div><div className="mt-0.5 text-[15px] font-semibold tabular-nums">{w.onHand.toLocaleString("en-IN")}</div></div>
                <div><div className="text-[#6B7280]">Capacity</div><div className="mt-0.5 text-[15px] font-semibold tabular-nums">{w.capacity?.toLocaleString("en-IN")}</div></div>
                <div><div className="text-[#6B7280]">Utilisation</div><div className={"mt-0.5 text-[15px] font-semibold tabular-nums " + (used > 85 ? "text-[#EF4444]" : "text-[#111827]")}>{used}%</div></div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div className={"h-full " + (used > 85 ? "bg-[#EF4444]" : used > 65 ? "bg-[#F59E0B]" : "bg-[#10B981]")} style={{ width: `${Math.min(100, used)}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#F3F4F6] pt-3 text-[11px]">
                <div><div className="text-[#6B7280]">Manager</div><div className="mt-0.5 font-medium text-[#111827]">{w.manager}</div><div className="text-[#6B7280]">{w.phone}</div></div>
                <div><div className="text-[#6B7280]">GSTIN</div><div className="mt-0.5 font-mono text-[11px] text-[#111827]">{w.gstin}</div></div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <WarehouseSheet w={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function WarehouseSheet({ w, onClose }: { w: Partial<W>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{w.id ? "Edit warehouse" : "New warehouse"}</div>
            <div className="text-[15px] font-semibold">{w.name || "Untitled warehouse"}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <F label="Warehouse code" defaultValue={w.id} />
            <F label="Display name" defaultValue={w.name} />
            <div className="col-span-2"><F label="Address" defaultValue={w.address} full /></div>
            <F label="City" defaultValue={w.city} />
            <F label="Pincode" defaultValue={""} />
            <F label="Manager" defaultValue={w.manager} />
            <F label="Manager phone" defaultValue={w.phone} />
            <F label="GSTIN" defaultValue={w.gstin} />
            <div>
              <label className="text-[11px] font-medium text-[#374151]">Type</label>
              <select defaultValue={w.type ?? "Owned"} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px]">
                <option>Owned</option><option>Rented</option><option>3PL — Delhivery</option><option>3PL — Blue Dart</option><option>3PL — Ekart</option>
              </select>
            </div>
            <F label="Capacity (units)" defaultValue={String(w.capacity ?? "")} />
            <F label="Cut-off time" defaultValue="17:30" />
            <div className="col-span-2 space-y-2 rounded-md border border-[#E5E7EB] p-3 text-[12px]">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Fulfil online orders</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Accept stock transfers</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Storefront pickup location</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Reserved for B2B / wholesale</label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3">
          {w.id ? <button className="text-[12px] font-medium text-[#EF4444]">Deactivate</button> : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] px-3 text-[12px] font-medium">Cancel</button>
            <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white">Save warehouse</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function F({ label, defaultValue, full }: { label: string; defaultValue?: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-[11px] font-medium text-[#374151]">{label}</label>
      <input defaultValue={defaultValue} className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]" />
    </div>
  );
}
