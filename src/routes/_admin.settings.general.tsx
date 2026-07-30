import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, TextArea, Toggle } from "@/components/admin/SettingsShell";
import { settingsService, type Setting } from "@/services/settings.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/settings/general")({
  component: GeneralSettings,
  head: () => ({ meta: [{ title: "General settings — BookAdmin" }] }),
});

function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setting, setSetting] = useState<Setting | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    email: "",
    domain: "",
    ecommerceUrl: "",
    adminUrl: "",
    userDomain: "",
    adminDomain: "",
    mobileDomain: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyGstin: "",
    freeShippingAmount: 499,
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
          title: settingData.title || "",
          email: settingData.email || "",
          domain: settingData.domain || "",
          ecommerceUrl: settingData.ecommerceUrl || "",
          adminUrl: settingData.adminUrl || "",
          userDomain: settingData.userDomain || "",
          adminDomain: settingData.adminDomain || "",
          mobileDomain: settingData.mobileDomain || "",
          companyName: settingData.companyName || "",
          companyPhone: settingData.companyPhone || "",
          companyAddress: settingData.companyAddress || "",
          companyCity: settingData.companyCity || "",
          companyGstin: settingData.companyGstin || "",
          freeShippingAmount: settingData.freeShippingAmount || 499,
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
      // Filter out empty strings to avoid validation errors
      const dataToSave = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== "")
      );
      // Ensure title is always present
      if (!dataToSave.title && !setting?.id) {
        toast.error("Workspace name is required");
        setSaving(false);
        return;
      }
      if (setting?.id) {
        await settingsService.update(setting.id, dataToSave);
        toast.success("Settings saved successfully");
      } else {
        const newSetting = await settingsService.create(dataToSave);
        setSetting(newSetting);
        toast.success("Settings created successfully");
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
        title="General"
        description="Workspace identity, regional defaults, and admin behavior across the bookstore backoffice."
      >
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="General"
      description="Workspace identity, regional defaults, and admin behavior across the bookstore backoffice."
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
      <Section title="Workspace" description="Public name, admin domain, and default language.">
        <Field label="Workspace name">
          <TextInput 
            value={formData.title} 
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Store name" 
          />
        </Field>
        <Field label="Ecommerce URL" hint="Public storefront URL">
          <TextInput 
            value={formData.ecommerceUrl} 
            onChange={(e) => updateField("ecommerceUrl", e.target.value)}
            placeholder="https://shop.example.com" 
          />
        </Field>
        <Field label="Admin URL" hint="Where staff sign in and manage the store.">
          <TextInput 
            value={formData.adminUrl} 
            onChange={(e) => updateField("adminUrl", e.target.value)}
            placeholder="https://admin.example.com" 
          />
        </Field>
        <Field label="Default language" cols={2}>
          <Select defaultValue="en-IN">
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">हिन्दी</option>
            <option value="kn-IN">ಕನ್ನಡ</option>
          </Select>
          <Select defaultValue="ltr">
            <option value="ltr">Left-to-right</option>
            <option value="rtl">Right-to-left</option>
          </Select>
        </Field>
      </Section>

      <Section title="Domain Settings" description="Configure your domain URLs.">
        <Field label="Main Domain">
          <TextInput 
            value={formData.domain} 
            onChange={(e) => updateField("domain", e.target.value)}
            placeholder="example.com" 
          />
        </Field>
        <Field label="User Domain" hint="Customer-facing domain">
          <TextInput 
            value={formData.userDomain} 
            onChange={(e) => updateField("userDomain", e.target.value)}
            placeholder="https://example.com" 
          />
        </Field>
        <Field label="Admin Domain">
          <TextInput 
            value={formData.adminDomain} 
            onChange={(e) => updateField("adminDomain", e.target.value)}
            placeholder="https://admin.example.com" 
          />
        </Field>
        <Field label="Mobile Domain">
          <TextInput 
            value={formData.mobileDomain} 
            onChange={(e) => updateField("mobileDomain", e.target.value)}
            placeholder="https://m.example.com" 
          />
        </Field>
      </Section>

      <Section title="Region & time" description="Applies to reports, invoices and scheduled jobs.">
        <Field label="Timezone">
          <Select defaultValue="Asia/Kolkata">
            <option>Asia/Kolkata (IST, UTC+05:30)</option>
            <option>Asia/Dubai (GST, UTC+04:00)</option>
            <option>Asia/Singapore (SGT, UTC+08:00)</option>
            <option>Europe/London (BST, UTC+01:00)</option>
          </Select>
        </Field>
        <Field label="Date format" cols={2}>
          <Select defaultValue="dmy">
            <option value="dmy">DD / MM / YYYY</option>
            <option value="mdy">MM / DD / YYYY</option>
            <option value="ymd">YYYY-MM-DD</option>
          </Select>
          <Select defaultValue="24">
            <option value="24">24-hour clock</option>
            <option value="12">12-hour clock</option>
          </Select>
        </Field>
        <Field label="Week starts on" cols={2}>
          <Select defaultValue="mon">
            <option value="mon">Monday</option>
            <option value="sun">Sunday</option>
          </Select>
          <Select defaultValue="apr">
            <option value="apr">Fiscal year — April</option>
            <option value="jan">Fiscal year — January</option>
          </Select>
        </Field>
      </Section>

      <Section title="Company Details" description="Company information for invoices and legal documents.">
        <Field label="Company Name">
          <TextInput 
            value={formData.companyName} 
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Company Name" 
          />
        </Field>
        <Field label="Email">
          <TextInput 
            type="email"
            value={formData.email} 
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="company@example.com" 
          />
        </Field>
        <Field label="Phone">
          <TextInput 
            value={formData.companyPhone} 
            onChange={(e) => updateField("companyPhone", e.target.value)}
            placeholder="+91 9876543210" 
          />
        </Field>
        <Field label="GSTIN">
          <TextInput 
            value={formData.companyGstin} 
            onChange={(e) => updateField("companyGstin", e.target.value)}
            placeholder="27AABCU9603R1ZM" 
          />
        </Field>
        <Field label="Address">
          <TextArea 
            value={formData.companyAddress} 
            onChange={(e) => updateField("companyAddress", e.target.value)}
            placeholder="Company address" 
          />
        </Field>
        <Field label="City">
          <TextInput 
            value={formData.companyCity} 
            onChange={(e) => updateField("companyCity", e.target.value)}
            placeholder="Mumbai" 
          />
        </Field>
      </Section>

      <Section title="Shipping" description="Configure shipping charges and thresholds.">
        <Field label="Free Shipping Amount" hint="Order amount above which shipping is free">
          <TextInput 
            type="number"
            value={formData.freeShippingAmount} 
            onChange={(e) => updateField("freeShippingAmount", e.target.value)}
            placeholder="499" 
          />
        </Field>
      </Section>

      <Section title="Support contact" description="Shown on invoices, packing slips and transactional emails.">
        <Field label="Support email" cols={2}>
          <TextInput defaultValue="support@sapnabooks.in" />
          <TextInput defaultValue="+91 80 4123 4567" />
        </Field>
        <Field label="Public help note">
          <TextArea defaultValue="Order queries: Mon–Sat, 10:00–19:00 IST. Please quote your order ID." />
        </Field>
      </Section>
    </SettingsShell>
  );
}