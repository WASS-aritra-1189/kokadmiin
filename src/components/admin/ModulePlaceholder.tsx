import { Sparkles } from "lucide-react";

export function ModulePlaceholder({
  title,
  group,
  description,
}: {
  title: string;
  group: string;
  description?: string;
}) {
  return (
    <div className="p-6">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">
        {group}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">
            {description ?? `Configure and manage ${title.toLowerCase()} for your bookstore.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
            Import
          </button>
          <button className="h-8 rounded-md bg-[#111827] px-3 text-[12px] font-medium text-white hover:bg-[#1F2937]">
            + New
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 h-6 w-24 rounded bg-[#F3F4F6]" />
            <div className="h-3 w-full rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-3 w-3/4 rounded bg-[#F3F4F6]" />
            <div className="mt-4 h-16 rounded bg-gradient-to-br from-[#FAFAF9] to-[#F3F4F6]" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white/60 p-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="mt-3 text-[14px] font-medium">Module scaffolded</div>
        <p className="mt-1 max-w-md text-[12px] text-[#6B7280]">
          The <span className="font-medium text-[#374151]">{title}</span> module is wired into
          navigation and permissions. Detailed workflows and data tables will land here in the
          next release.
        </p>
      </div>
    </div>
  );
}
