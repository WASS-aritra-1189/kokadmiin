import { CalendarDays, X } from "lucide-react";

interface Props {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear: () => void;
}

function toISO(d: Date) {
  return d.toISOString().split("T")[0];
}

const PRESETS = [
  {
    label: "Today",
    get() {
      const t = toISO(new Date());
      return { from: t, to: t };
    },
  },
  {
    label: "This Week",
    get() {
      const now = new Date();
      const day = now.getDay(); // 0=Sun
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((day + 6) % 7));
      return { from: toISO(mon), to: toISO(now) };
    },
  },
  {
    label: "This Month",
    get() {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISO(first), to: toISO(now) };
    },
  },
  {
    label: "Last Month",
    get() {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toISO(first), to: toISO(last) };
    },
  },
];

export function DateRangeFilter({ from, to, onFromChange, onToChange, onClear }: Props) {
  const active = from || to;

  const activePreset = PRESETS.find((p) => {
    const r = p.get();
    return r.from === from && r.to === to;
  })?.label;

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    const r = p.get();
    onFromChange(r.from);
    onToChange(r.to);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Preset buttons */}
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => (activePreset === p.label ? onClear() : applyPreset(p))}
          className={`h-8 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
            activePreset === p.label
              ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#4F46E5] hover:text-[#4F46E5]"
          }`}
        >
          {p.label}
        </button>
      ))}

      {/* Divider */}
      <div className="h-5 w-px bg-[#E5E7EB]" />

      {/* Custom range */}
      <div className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#6B7280]" />
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-6 w-[120px] bg-transparent text-[12px] text-[#111827] outline-none"
          title="From date"
        />
        <span className="text-[11px] text-[#9CA3AF]">–</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onToChange(e.target.value)}
          className="h-6 w-[120px] bg-transparent text-[12px] text-[#111827] outline-none"
          title="To date"
        />
      </div>

      {/* Clear */}
      {active && (
        <button
          onClick={onClear}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
          title="Clear date filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
