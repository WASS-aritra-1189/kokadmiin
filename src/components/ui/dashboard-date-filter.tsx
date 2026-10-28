import { CalendarDays, X } from "lucide-react";

export interface DashboardDateState {
  preset: string;       // today | last_week | this_month | custom  (used as filter= param)
  groupBy: string;      // today | week | month | custom            (used as groupBy= param)
  startDate: string;
  endDate: string;
}

const PRESETS = [
  { label: "Today",      preset: "today",      groupBy: "today" },
  { label: "Last 7 days",preset: "last_week",  groupBy: "week"  },
  { label: "This Month", preset: "this_month", groupBy: "month" },
  { label: "Custom",     preset: "custom",     groupBy: "custom"},
];

function toISO(d: Date) { return d.toISOString().split("T")[0]; }

export function defaultDashboardDate(preset = "last_week"): DashboardDateState {
  const p = PRESETS.find((x) => x.preset === preset) ?? PRESETS[1];
  return { preset: p.preset, groupBy: p.groupBy, startDate: "", endDate: "" };
}

interface Props {
  value: DashboardDateState;
  onChange: (v: DashboardDateState) => void;
}

export function DashboardDateFilter({ value, onChange }: Props) {
  const isCustom = value.preset === "custom";

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    onChange({ preset: p.preset, groupBy: p.groupBy, startDate: "", endDate: "" });
  };

  const setCustomDate = (field: "startDate" | "endDate", v: string) => {
    onChange({ ...value, preset: "custom", groupBy: "custom", [field]: v });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESETS.filter((p) => p.preset !== "custom").map((p) => (
        <button
          key={p.preset}
          onClick={() => applyPreset(p)}
          className={`h-8 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
            value.preset === p.preset
              ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#4F46E5] hover:text-[#4F46E5]"
          }`}
        >
          {p.label}
        </button>
      ))}

      <div className="h-5 w-px bg-[#E5E7EB]" />

      {/* Custom range */}
      <div className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors ${
        isCustom ? "border-[#4F46E5] bg-[#EEF2FF]" : "border-[#E5E7EB] bg-white"
      }`}>
        <CalendarDays className={`h-3.5 w-3.5 shrink-0 ${isCustom ? "text-[#4F46E5]" : "text-[#6B7280]"}`} />
        <span className={`shrink-0 text-[11px] font-medium ${isCustom ? "text-[#4F46E5]" : "text-[#6B7280]"}`}>From</span>
        <input
          type="date"
          value={value.startDate}
          max={value.endDate || undefined}
          onChange={(e) => setCustomDate("startDate", e.target.value)}
          className="h-6 w-[120px] bg-transparent text-[12px] text-[#111827] outline-none"
        />
        <span className="shrink-0 text-[11px] text-[#9CA3AF]">–</span>
        <span className={`shrink-0 text-[11px] font-medium ${isCustom ? "text-[#4F46E5]" : "text-[#6B7280]"}`}>To</span>
        <input
          type="date"
          value={value.endDate}
          min={value.startDate || undefined}
          onChange={(e) => setCustomDate("endDate", e.target.value)}
          className="h-6 w-[120px] bg-transparent text-[12px] text-[#111827] outline-none"
        />
        {isCustom && (value.startDate || value.endDate) && (
          <button
            onClick={() => onChange({ ...value, startDate: "", endDate: "" })}
            className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#C7D2FE]"
            title="Clear custom dates"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
