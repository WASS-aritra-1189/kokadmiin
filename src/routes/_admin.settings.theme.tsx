import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle } from "@/components/admin/SettingsShell";

export const Route = createFileRoute("/_admin/settings/theme")({
  component: ThemeSettings,
  head: () => ({ meta: [{ title: "Theme settings — BookAdmin" }] }),
});

const SWATCHES = ["#4F46E5", "#111827", "#0F766E", "#B45309", "#BE185D", "#0EA5E9"];

function ThemeSettings() {
  return (
    <SettingsShell
      title="Theme"
      description="Brand identity for the storefront, admin console and transactional documents."
    >
      <Section title="Brand" description="Uploaded once, used everywhere.">
        <Field label="Logo (light / dark)" cols={2}>
          <button className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-white text-[12px] text-[#6B7280] hover:bg-[#FAFAF9]">
            Upload light logo · SVG or PNG
          </button>
          <button className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-[#111827] text-[12px] text-white/70 hover:bg-[#1F2937]">
            Upload dark logo · SVG or PNG
          </button>
        </Field>
        <Field label="Favicon" cols={2}>
          <TextInput defaultValue="favicon.svg" />
          <TextInput defaultValue="Sapna Books" placeholder="Browser tab title" />
        </Field>
      </Section>

      <Section title="Colors" description="Primary color drives buttons, links and highlights.">
        <Field label="Primary">
          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((c, i) => (
              <button
                key={c}
                aria-label={c}
                className={
                  "h-8 w-8 rounded-full ring-2 ring-offset-2 transition " +
                  (i === 0 ? "ring-[#111827]" : "ring-transparent")
                }
                style={{ background: c }}
              />
            ))}
            <TextInput defaultValue="#4F46E5" className="!h-8 !w-28" />
          </div>
        </Field>
        <Field label="Accent / danger" cols={2}>
          <TextInput defaultValue="#9333EA" placeholder="Accent" />
          <TextInput defaultValue="#EF4444" placeholder="Danger" />
        </Field>
        <div className="grid gap-2">
          <Toggle label="Enable dark mode for storefront" defaultChecked description="Respects OS preference by default." />
          <Toggle label="High-contrast admin theme" description="For warehouse staff on low-glare screens." />
        </div>
      </Section>

      <Section title="Typography" description="Font pairing across the storefront and reader.">
        <Field label="Display / body" cols={2}>
          <Select defaultValue="fraunces-inter">
            <option value="fraunces-inter">Fraunces + Inter</option>
            <option value="playfair-inter">Playfair Display + Inter</option>
            <option value="dm-serif-dm-sans">DM Serif + DM Sans</option>
            <option value="ibm-plex">IBM Plex Serif + IBM Plex Sans</option>
          </Select>
          <Select defaultValue="14">
            <option value="13">Compact — 13px base</option>
            <option value="14">Comfortable — 14px base</option>
            <option value="15">Spacious — 15px base</option>
          </Select>
        </Field>
        <Field label="Border radius / density" cols={2}>
          <Select defaultValue="md">
            <option value="none">Sharp — 0px</option>
            <option value="sm">Subtle — 4px</option>
            <option value="md">Rounded — 8px</option>
            <option value="lg">Soft — 12px</option>
          </Select>
          <Select defaultValue="regular">
            <option value="dense">Dense</option>
            <option value="regular">Regular</option>
            <option value="cozy">Cozy</option>
          </Select>
        </Field>
      </Section>

      <Section title="Preview" description="Live preview of your button and header styling.">
        <div className="rounded-xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#FAFAFB] p-6">
          <div className="text-[11px] uppercase tracking-widest text-[#6B7280]">Storefront preview</div>
          <div className="mt-2 font-serif text-[24px] font-semibold text-[#111827]">Discover your next great read.</div>
          <p className="mt-1 max-w-md text-[13px] text-[#6B7280]">Curated collections, editorial notes, and hand-picked recommendations from our booksellers.</p>
          <div className="mt-4 flex gap-2">
            <button className="h-9 rounded-md bg-[#4F46E5] px-4 text-[12.5px] font-medium text-white hover:bg-[#4338CA]">Browse catalog</button>
            <button className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[12.5px] font-medium text-[#374151] hover:bg-[#F9FAFB]">Read the journal</button>
          </div>
        </div>
      </Section>
    </SettingsShell>
  );
}
