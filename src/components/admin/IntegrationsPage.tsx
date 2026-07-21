import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Search, Settings2, X } from "lucide-react";
import { toast } from "sonner";

export type ConfigServiceType = {
  getPaymentConfig?: () => Promise<any>;
  updatePaymentConfig?: (data: any) => Promise<any>;
  getCourierConfig?: () => Promise<any>;
  updateCourierConfig?: (data: any) => Promise<any>;
  getEmailConfig?: () => Promise<any>;
  updateEmailConfig?: (data: any) => Promise<any>;
  sendTestEmail?: (email: string) => Promise<any>;
  getSmsConfig?: () => Promise<any>;
  updateSmsConfig?: (data: any) => Promise<any>;
};

export type Provider = {
  id: string;
  name: string;
  tagline: string;
  logo: string; // 2-3 letter monogram
  color: string; // background color for monogram
  status: "connected" | "available" | "beta";
  meta?: { label: string; value: string }[];
  fields: FieldSpec[];
};

export type FieldSpec = {
  name: string;
  label: string;
  type?: "text" | "password" | "select" | "toggle" | "textarea" | "url";
  placeholder?: string;
  options?: string[];
  help?: string;
  full?: boolean;
};

export function IntegrationsPage({
  group,
  title,
  description,
  providers: initialProviders,
  extras,
  isLoading = false,
  configEndpoint,
  configService,
}: {
  group: string;
  title: string;
  description: string;
  providers: Provider[];
  extras?: ReactNode;
  isLoading?: boolean;
  configEndpoint?: string;
  configService?: ConfigServiceType;
}) {
  const [providers, setProviders] = useState(initialProviders);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "connected" | "available">("all");
  const [editing, setEditing] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const filtered = providers.filter((p) => {
    if (filter === "connected" && p.status !== "connected") return false;
    if (filter === "available" && p.status === "connected") return false;
    if (q && !`${p.name} ${p.tagline}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const connectedCount = providers.filter((p) => p.status === "connected").length;

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">{group}</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"><Settings2 className="h-3.5 w-3.5" />API keys</button>
          <button className="flex h-8 items-center gap-1.5 rounded-md bg-[#111827] px-2.5 text-[12px] font-medium text-white hover:bg-[#1F2937]"><Plus className="h-3.5 w-3.5" />Request integration</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <StatCard label="Providers" value={providers.length} />
        <StatCard label="Connected" value={connectedCount} tone="ok" />
        <StatCard label="Available" value={providers.length - connectedCount} />
        <StatCard label="Beta" value={providers.filter((p) => p.status === "beta").length} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search providers…" className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]" />
        </div>
        <div className="flex overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
          {(["all", "connected", "available"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={"h-8 px-3 text-[11px] font-medium capitalize " + (filter === f ? "bg-[#111827] text-white" : "text-[#374151] hover:bg-[#F9FAFB]")}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="group flex flex-col rounded-lg border border-[#E5E7EB] bg-white p-4 hover:border-[#D1D5DB]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: p.color }}>{p.logo}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-[13px] font-semibold">{p.name}</div>
                  {p.status === "beta" && <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-medium text-[#92400E]">Beta</span>}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[#6B7280]">{p.tagline}</p>
              </div>
              <StatusPill status={p.status} />
            </div>

            {p.meta && p.meta.length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-[#FAFAF9] p-2.5 text-[11px]">
                {p.meta.map((m) => (
                  <div key={m.label}>
                    <dt className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">{m.label}</dt>
                    <dd className="mt-0.5 truncate font-medium text-[#111827]">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setEditing(p)}
                className="h-7 flex-1 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >Configure</button>
              <button
                onClick={() => setEditing(p)}
                className={"h-7 flex-1 rounded-md text-[11px] font-medium " + (p.status === "connected" ? "border border-[#E5E7EB] bg-white text-[#EF4444] hover:bg-[#FEF2F2]" : "bg-[#4F46E5] text-white hover:bg-[#4338CA]")}
              >{p.status === "connected" ? "Disconnect" : "Connect"}</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-[#E5E7EB] bg-white p-10 text-center text-[12px] text-[#6B7280]">No providers match your filters.</div>
        )}
      </div>

      {extras}

      {editing && (
        <ConfigureSheet 
          provider={editing} 
          onClose={() => setEditing(null)} 
          configEndpoint={configEndpoint}
          configService={configService}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: "ok" }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{label}</div>
      <div className={"mt-1 text-[22px] font-semibold tabular-nums " + (tone === "ok" ? "text-[#10B981]" : "")}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Provider["status"] }) {
  if (status === "connected") {
    return <span className="flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#166534]"><Check className="h-3 w-3" />Connected</span>;
  }
  return <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]">Available</span>;
}

function ConfigureSheet({ provider, onClose, configEndpoint, configService }: { provider: Provider; onClose: () => void; configEndpoint?: string; configService?: ConfigServiceType }) {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (configEndpoint === "payment-gateway" && configService?.updatePaymentConfig) {
        return configService.updatePaymentConfig(data);
      }
      if (configEndpoint === "courier-gateway" && configService?.updateCourierConfig) {
        return configService.updateCourierConfig(data);
      }
      if (configEndpoint === "email" && configService?.updateEmailConfig) {
        return configService.updateEmailConfig(data);
      }
      if (configEndpoint === "sms-gateway" && configService?.updateSmsConfig) {
        return configService.updateSmsConfig(data);
      }
      throw new Error("No update function available");
    },
    onSuccess: () => {
      toast.success("Configuration saved successfully");
      queryClient.invalidateQueries({ queryKey: [configEndpoint] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to save configuration");
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (configEndpoint === "email" && configService?.sendTestEmail && formData.testEmail) {
        return configService.sendTestEmail(formData.testEmail);
      }
      throw new Error("Test not available");
    },
    onSuccess: () => {
      toast.success("Test email sent successfully");
    },
    onError: () => {
      toast.error("Failed to send test email");
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await testMutation.mutateAsync();
    } finally {
      setTesting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: provider.color }}>{provider.logo}</div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{provider.status === "connected" ? "Configure" : "Connect"}</div>
              <div className="text-[15px] font-semibold">{provider.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <div className="border-b border-[#F3F4F6] px-5 py-3">
          <div className="text-[11px] font-medium text-[#374151]">Environment</div>
          <div className="mt-2 flex overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
            {(["test", "live"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={"h-7 flex-1 text-[11px] font-medium capitalize " + (mode === m ? "bg-[#111827] text-white" : "text-[#374151] hover:bg-[#F9FAFB]")}>{m}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            {provider.fields.map((f) => (
              <div key={f.name} className={f.full || f.type === "textarea" ? "col-span-2" : ""}>
                <label className="text-[11px] font-medium text-[#374151]">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea 
                    rows={3} 
                    placeholder={f.placeholder}
                    value={formData[f.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })} 
                    className="mt-1 w-full rounded-md border border-[#E5E7EB] bg-white p-2 font-mono text-[11px] outline-none focus:border-[#4F46E5]" 
                  />
                ) : f.type === "select" ? (
                  <select 
                    className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] outline-none focus:border-[#4F46E5]"
                    value={formData[f.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  >
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "toggle" ? (
                  <div className="mt-1 flex h-8 items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={formData[f.name] === "true" || formData[f.name] === undefined}
                      onChange={(e) => setFormData({ ...formData, [f.name]: String(e.target.checked) })}
                    />
                    <span className="text-[12px] text-[#6B7280]">Enabled</span>
                  </div>
                ) : (
                  <input
                    type={f.type === "password" ? "password" : "text"}
                    placeholder={f.placeholder}
                    value={formData[f.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="mt-1 h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 font-mono text-[11px] outline-none focus:border-[#4F46E5]"
                  />
                )}
                {f.help && <div className="mt-1 text-[10px] text-[#6B7280]">{f.help}</div>}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-md bg-[#FAFAF9] p-3 text-[11px] text-[#6B7280]">
            Credentials are encrypted at rest. Use <span className="font-mono text-[#374151]">test</span> mode for QA and switch to <span className="font-mono text-[#374151]">live</span> before enabling on the storefront.
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3">
          {provider.status === "connected" ? (
            <button className="text-[12px] font-medium text-[#EF4444] hover:underline">Disconnect</button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">Cancel</button>
            <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium">Test connection</button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
