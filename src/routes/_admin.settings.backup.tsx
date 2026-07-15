import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Field, TextInput, Select, Toggle, Badge } from "@/components/admin/SettingsShell";
import { CheckCircle2, Download, HardDrive } from "lucide-react";

export const Route = createFileRoute("/_admin/settings/backup")({
  component: BackupSettings,
  head: () => ({ meta: [{ title: "Backup settings — BookAdmin" }] }),
});

const BACKUPS = [
  { id: "bkp_9812", when: "Today, 03:00 IST", size: "482 MB", type: "Full", status: "success" },
  { id: "bkp_9811", when: "Yesterday, 03:00 IST", size: "479 MB", type: "Full", status: "success" },
  { id: "bkp_9810", when: "Mon, 30 Sep · 03:00 IST", size: "12 MB", type: "Incremental", status: "success" },
  { id: "bkp_9809", when: "Sun, 29 Sep · 03:00 IST", size: "11 MB", type: "Incremental", status: "warn" },
];

function BackupSettings() {
  return (
    <SettingsShell
      title="Backup"
      description="Automated backups of the catalog, orders, customers and media library."
    >
      <Section
        title="Schedule"
        description="When and how often backups run. Full backups on Sunday, incremental daily."
        aside={<div className="mt-3"><Badge tone="success">Encryption AES-256</Badge></div>}
      >
        <Field label="Frequency" cols={2}>
          <Select defaultValue="daily">
            <option value="hourly">Hourly (heavy — enterprise)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly (Sunday only)</option>
          </Select>
          <Select defaultValue="0300">
            <option value="0100">01:00 IST</option>
            <option value="0300">03:00 IST</option>
            <option value="0500">05:00 IST</option>
          </Select>
        </Field>
        <Field label="Retention" cols={2}>
          <Select defaultValue="30">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </Select>
          <Select defaultValue="s3">
            <option value="s3">Amazon S3 · ap-south-1</option>
            <option value="gcs">Google Cloud Storage</option>
            <option value="local">On-premise NAS</option>
          </Select>
        </Field>
        <div className="grid gap-2">
          <Toggle label="Include media library (product images, invoices)" defaultChecked />
          <Toggle label="Include eBook / audiobook binaries" description="Large — increases backup time significantly." />
          <Toggle label="Verify backup integrity after upload" defaultChecked />
        </div>
      </Section>

      <Section title="Recent backups" description="Download or restore a specific snapshot.">
        <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
          {BACKUPS.map((b) => (
            <div key={b.id} className="flex items-center gap-4 p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F3F4F6] text-[#374151]">
                <HardDrive className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-[12px] text-[#111827]">{b.id}</div>
                  <Badge tone={b.status === "success" ? "success" : "warn"}>
                    {b.status === "success" ? "verified" : "checksum warn"}
                  </Badge>
                </div>
                <div className="mt-0.5 text-[11.5px] text-[#6B7280]">
                  {b.when} · {b.type} · {b.size}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {b.status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />}
                <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[11.5px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button className="h-8 rounded-md bg-[#111827] px-2.5 text-[11.5px] font-medium text-white hover:bg-[#1F2937]">
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Manual backup" description="Trigger an on-demand full backup right now.">
        <Field label="Note (optional)">
          <TextInput placeholder="e.g. Pre-migration snapshot before v2.5" />
        </Field>
        <div>
          <button className="h-9 rounded-md bg-[#4F46E5] px-4 text-[12px] font-medium text-white hover:bg-[#4338CA]">
            Run backup now
          </button>
        </div>
      </Section>
    </SettingsShell>
  );
}
