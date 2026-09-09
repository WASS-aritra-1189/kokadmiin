import { useState } from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function PaginationBar({ page, totalPages, onPageChange }: Props) {
  const [jump, setJump] = useState("");

  const pages = getWindowedPages(page, totalPages);

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-[#9CA3AF]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={"rounded-md px-2 py-1 " + (p === page ? "bg-[#111827] text-white" : "border border-[#E5E7EB]")}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-[#E5E7EB] px-2 py-1 disabled:opacity-40"
      >
        Next
      </button>

      {totalPages > 10 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = parseInt(jump);
            if (n >= 1 && n <= totalPages) { onPageChange(n); setJump(""); }
          }}
          className="ml-1 flex items-center gap-1"
        >
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            placeholder="Go to"
            className="h-7 w-16 rounded-md border border-[#E5E7EB] bg-white px-2 text-[11px] outline-none focus:border-[#4F46E5]"
          />
          <button type="submit" className="rounded-md border border-[#E5E7EB] px-2 py-1 text-[11px] hover:bg-[#F9FAFB]">
            Go
          </button>
        </form>
      )}
    </div>
  );
}

function getWindowedPages(current: number, total: number): (number | "...")[] {
  if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = current - delta;
  const right = current + delta;

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
