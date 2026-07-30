import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, TextArea, Select, Badge } from "@/components/admin/SettingsShell";
import { settingsService, type Setting } from "@/services/settings.service";
import { Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/settings/company")({
  component: CompanySettings,
  head: () => ({ meta: [{ title: "Company — BookAdmin" }] }),
});

function CompanySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setting, setSetting] = useState<Setting | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyPhone: "",
    companyGstin: "",
    email: "",
    clinicAddress: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getAll({ limit: 1 });
      if (response.data?.length > 0) {
        const settingData = response.data[0];
        setSetting(settingData);
        setFormData({
          companyName: settingData.companyName || "",
          companyAddress: settingData.companyAddress || "",
          companyCity: settingData.companyCity || "",
          companyPhone: settingData.companyPhone || "",
          companyGstin: settingData.companyGstin || "",
          email: settingData.email || "",
          clinicAddress: settingData.clinicAddress || "",
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== "")
      );

      if (setting?.id) {
        await settingsService.update(setting.id, dataToSave);
        toast.success("Company settings saved successfully");
      } else {
        // Create with default title if no setting exists
        const newSetting = await settingsService.create({ 
          title: "Default Settings",
          ...dataToSave 
        });
        setSetting(newSetting);
        toast.success("Company settings created successfully");
      }
      await loadSettings();
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      const msg = error?.response?.data?.data?.errors?.[0] || error?.response?.data?.message || "Failed to save settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SettingsShell
        title="Company"
        description="Legal entity, registered address and compliance identifiers used on invoices and shipping labels."
      >
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Company"
      description="Legal entity, registered address and compliance identifiers used on invoices and shipping labels."
      actions={
        <>
          <button 
            className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
            onClick={loadSettings}
            disabled={saving}
          >
            Discard
          </button>
          <button 
            className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white hover:bg-[#1F2937] disabled:opacity50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </>
      }
    >
      <Section title="Legal entity" description="Appears on every tax invoice and courier manifest.">
        <Field label="Legal name">
          <TextInput 
            value={formData.companyName} 
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Company Legal Name" 
          />
        </Field>
        <Field label="Email" cols={1}>
          <TextInput 
            type="email"
            value={formData.email} 
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="company@example.com" 
          />
        </Field>
        <Field label="GSTIN">
          <TextInput 
            value={formData.companyGstin} 
            onChange={(e) => updateField("companyGstin", e.target.value)}
            placeholder="27AABCU9603R1ZM" 
          />
        </Field>
        <Field label="Phone">
          <TextInput 
            value={formData.companyPhone} 
            onChange={(e) => updateField("companyPhone", e.target.value)}
            placeholder="+91 9876543210" 
          />
        </Field>
      </Section>

      <Section title="Registered address" description="Head office address printed on legal documents.">
        <Field label="Street">
          <TextArea 
            value={formData.companyAddress} 
            onChange={(e) => updateField("companyAddress", e.target.value)}
            placeholder="Street address" 
          />
        </Field>
        <Field label="City / State / PIN" cols={2}>
          <TextInput 
            value={formData.companyCity} 
            onChange={(e) => updateField("companyCity", e.target.value)}
            placeholder="City" 
          />
          <TextInput 
            value={formData.clinicAddress} 
            onChange={(e) => updateField("clinicAddress", e.target.value)}
            placeholder="State — PIN" 
          />
        </Field>
      </Section>

      <Section
        title="Warehouses"
        description="Ship-from locations. Add or edit warehouses in Inventory → Warehouses."
        aside={<div className="mt-3"><Badge tone="info">4 active</Badge></div>}
      >
        <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
          {[
            { name: "Bengaluru — Main", addr: "Peenya Industrial Area, Phase 2, Bengaluru 560058", gstin: "29AAACS1234K1Z5", primary: true },
            { name: "Mumbai — West", addr: "Andheri MIDC, Marol, Mumbai 400093", gstin: "27AAACS1234K1Z3" },
            { name: "Delhi NCR", addr: "Sector 63, Noida, UP 201301", gstin: "09AAACS1234K1Z1" },
            { name: "Kolkata East", addr: "Salt Lake Sector V, Kolkata 700091", gstin: "19AAACS1234K1Z8" },
          ].map((w) => (
            <div key={w.name} className="flex items-start justify-between gap-4 p-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#4F46E5]">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-medium">{w.name}</div>
                    {w.primary && <Badge tone="success">Primary</Badge>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-[#6B7280]">
                    <MapPin className="h-3 w-3" /> {w.addr}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#9CA3AF]">GSTIN {w.gstin}</div>
                </div>
              </div>
              <button className="text-[11.5px] font-medium text-[#4F46E5] hover:underline">Edit</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Signing authority" description="Printed as authorized signatory on tax invoices.">
        <Field label="Name / designation" cols={2}>
          <TextInput defaultValue="Nitin R. Shanbhag" />
          <TextInput defaultValue="Director — Finance" />
        </Field>
      </Section>
    </SettingsShell>
  );
}