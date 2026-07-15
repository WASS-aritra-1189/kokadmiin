import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Settings2, Store, Building2, Receipt, CreditCard, Truck, Mail, MessageSquare,
  Bell, DollarSign, Palette, DatabaseBackup, Wrench, ScrollText, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsNavItem = { label: string; to: string; icon: LucideIcon; desc: string };

export const SETTINGS_NAV: SettingsNavItem[] = [
  { label: "General", to: "/settings/general", icon: Settings2, desc: "Site name, timezone, defaults" },
  { label: "Store", to: "/settings/store", icon: Store, desc: "Storefront, checkout, catalog" },
  { label: "Company", to: "/settings/company", icon: Building2, desc: "Legal entity, addresses, PAN" },
  { label: "GST", to: "/settings/gst", icon: Receipt, desc: "GSTIN, HSN defaults, invoice series" },
  { label: "Payments", to: "/settings/payments", icon: CreditCard, desc: "Gateways, COD, refund policy" },
  { label: "Shipping", to: "/settings/shipping", icon: Truck, desc: "Carriers, zones, packaging" },
  { label: "Email", to: "/settings/email", icon: Mail, desc: "SMTP, from address, DKIM" },
  { label: "SMS", to: "/settings/sms", icon: MessageSquare, desc: "Provider, sender ID, DLT" },
  { label: "Notifications", to: "/settings/notifications", icon: Bell, desc: "Events, channels, digests" },
  { label: "Currency", to: "/settings/currency", icon: DollarSign, desc: "Base currency, rounding, FX" },
  { label: "Theme", to: "/settings/theme", icon: Palette, desc: "Brand, colors, typography" },
  { label: "Backup", to: "/settings/backup", icon: DatabaseBackup, desc: "Schedule, retention, restore" },
  { label: "Maintenance", to: "/settings/maintenance", icon: Wrench, desc: "Downtime, banners, allowlist" },
  { label: "System Logs", to: "/settings/logs", icon: ScrollText, desc: "Audit trail, exports" },
];

export function SettingsShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Secondary sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[#E5E7EB] bg-white lg:block">
        <div className="border-b border-[#E5E7EB] px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Configuration</div>
          <div className="mt-0.5 text-[14px] font-semibold">Settings</div>
        </div>
        <nav className="p-2">
          {SETTINGS_NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group mb-0.5 flex items-start gap-2.5 rounded-md px-2.5 py-1.5 transition-colors",
                  active
                    ? "bg-[#EEF2FF] text-[#4F46E5]"
                    : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]",
                )}
              >
                <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", active ? "text-[#4F46E5]" : "text-[#9CA3AF]")} />
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium leading-tight">{item.label}</div>
                  <div className="mt-0.5 truncate text-[10.5px] leading-tight text-[#9CA3AF]">{item.desc}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-[#E5E7EB] bg-white px-6 py-5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-[#374151]">{title}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              {actions ?? (
                <>
                  <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                    Discard
                  </button>
                  <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white hover:bg-[#1F2937]">
                    Save changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Reusable primitives for settings pages ---------- */

export function Section({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="mb-6 grid gap-6 rounded-xl border border-[#E5E7EB] bg-white p-5 lg:grid-cols-[260px_1fr]">
      <div>
        <h2 className="text-[13.5px] font-semibold text-[#111827]">{title}</h2>
        {description && <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280]">{description}</p>}
        {aside}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  cols = 1,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  cols?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-3", cols === 2 && "sm:grid-cols-2")}>
      <div className="sm:col-span-full">
        <label className="text-[12px] font-medium text-[#374151]">{label}</label>
        {hint && <div className="mt-0.5 text-[11px] text-[#9CA3AF]">{hint}</div>}
      </div>
      <div className={cn("sm:col-span-full", cols === 2 && "sm:col-span-full sm:grid sm:grid-cols-2 sm:gap-3")}>
        {children}
      </div>
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4F46E5]",
        props.className,
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[80px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4F46E5]",
        props.className,
      )}
    />
  );
}

export function Select({
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={cn(
        "h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[13px] outline-none focus:border-[#4F46E5]",
        rest.className,
      )}
    >
      {children}
    </select>
  );
}

export function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAF9] p-3 hover:bg-white">
      <div>
        <div className="text-[12.5px] font-medium text-[#111827]">{label}</div>
        {description && <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{description}</div>}
      </div>
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-5 w-9 rounded-full bg-[#E5E7EB] transition peer-checked:bg-[#4F46E5]" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "success" | "warn" | "danger" | "info";
  children: ReactNode;
}) {
  const tones = {
    muted: "bg-[#F3F4F6] text-[#374151]",
    success: "bg-[#ECFDF5] text-[#047857]",
    warn: "bg-[#FEF3C7] text-[#B45309]",
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    info: "bg-[#EEF2FF] text-[#4F46E5]",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}
