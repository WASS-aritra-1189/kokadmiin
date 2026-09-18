import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Search, RefreshCw } from "lucide-react";
import { genreService, type Genre } from "@/services/genre.service";

export const Route = createFileRoute("/_admin/catalog/genres")({ component: Page });

// ── build tree from flat array ────────────────────────────────────────────────
function buildTree(genres: Genre[]): (Genre & { children: Genre[] })[] {
  const byId: Record<string, Genre & { children: Genre[] }> = {};
  for (const g of genres) byId[g.id] = { ...g, children: [] };
  const roots: (Genre & { children: Genre[] })[] = [];
  for (const g of Object.values(byId)) {
    if (g.parentId && byId[g.parentId]) byId[g.parentId].children.push(g);
    else roots.push(g);
  }
  return roots;
}

// ── flatten tree for search ───────────────────────────────────────────────────
function flattenTree(nodes: (Genre & { children: Genre[] })[]): Genre[] {
  const result: Genre[] = [];
  function walk(list: (Genre & { children: Genre[] })[]) {
    for (const n of list) { result.push(n); walk(n.children as any); }
  }
  walk(nodes);
  return result;
}

// ── single tree node ──────────────────────────────────────────────────────────
function TreeNode({
  node, depth, onStatusToggle, onDelete, expandedIds, toggleExpand,
}: {
  node: Genre & { children: (Genre & { children: Genre[] })[] };
  depth: number;
  onStatusToggle: (g: Genre) => void;
  onDelete: (g: Genre) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <>
      <tr className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 20 }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="shrink-0 text-[#9CA3AF] hover:text-[#374151]"
              >
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            <span className="font-medium text-[12px]">{node.name}</span>
            {node.shortCode && (
              <span className="ml-1.5 rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] text-[#6B7280] font-mono">
                {node.shortCode}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5 text-[12px] text-[#6B7280]">
          {node.level ?? "—"}
        </td>
        <td className="px-4 py-2.5 text-[12px] text-[#6B7280] font-mono">
          {node.externalId ?? "—"}
        </td>
        <td className="px-4 py-2.5 text-[12px] text-[#6B7280] truncate max-w-[180px]">
          {node.description ?? "—"}
        </td>
        <td className="px-4 py-2.5">
          <button
            onClick={() => onStatusToggle(node)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              node.status === "ACTIVE"
                ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
            }`}
          >
            {node.status}
          </button>
        </td>
        <td className="px-4 py-2.5 text-right">
          <button
            onClick={() => onDelete(node)}
            className="rounded-md border border-[#FEE2E2] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
          >
            Delete
          </button>
        </td>
      </tr>
      {hasChildren && isExpanded &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child as any}
            depth={depth + 1}
            onStatusToggle={onStatusToggle}
            onDelete={onDelete}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
          />
        ))
      }
    </>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
function Page() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<Genre | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await genreService.getActive();
      const data: Genre[] = Array.isArray(res) ? res : (res?.data ?? []);
      setGenres(data);
      // auto-expand level 1 and 2
      const toExpand = new Set<string>();
      for (const g of data) {
        if (g.level != null && g.level <= 2) toExpand.add(g.id);
      }
      setExpandedIds(toExpand);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const tree = buildTree(genres);

  // filter: if searching, show flat filtered list; else show tree
  const filtered = q.trim()
    ? flattenTree(tree).filter((g) =>
        g.name.toLowerCase().includes(q.toLowerCase()) ||
        g.shortCode?.toLowerCase().includes(q.toLowerCase())
      )
    : null;

  const handleStatusToggle = async (g: Genre) => {
    const next = g.status === "ACTIVE" ? "DEACTIVE" : "ACTIVE";
    await genreService.changeStatus(g.id, next);
    load();
  };

  const handleDelete = async (g: Genre) => {
    setDeleting(true);
    try {
      await genreService.delete(g.id);
      load();
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(genres.map((g) => g.id)));
  const collapseAll = () => setExpandedIds(new Set());

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Genres</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Product hierarchy tree synced from WINBDS. Read-only — managed via ERP push.
          </p>
        </div>
        <button
          onClick={load}
          className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">Total</div>
          <div className="mt-1 text-[22px] font-semibold tabular-nums">{genres.length}</div>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">Active</div>
          <div className="mt-1 text-[22px] font-semibold tabular-nums">
            {genres.filter((g) => g.status === "ACTIVE").length}
          </div>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">Max Depth</div>
          <div className="mt-1 text-[22px] font-semibold tabular-nums">
            {genres.length ? Math.max(...genres.map((g) => g.level ?? 0)) : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or short code…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          {!q && (
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="h-8 rounded-md border border-[#E5E7EB] px-2.5 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >
                Expand all
              </button>
              <button
                onClick={collapseAll}
                className="h-8 rounded-md border border-[#E5E7EB] px-2.5 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >
                Collapse all
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Level</th>
                <th className="px-4 py-2 text-left">External ID</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">Loading…</td></tr>
              )}
              {!loading && genres.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">No genres found. Push data from WINBDS first.</td></tr>
              )}
              {/* flat search results */}
              {!loading && filtered &&
                filtered.map((g) => (
                  <tr key={g.id} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]">
                    <td className="px-4 py-2.5 font-medium">
                      {g.name}
                      {g.shortCode && (
                        <span className="ml-1.5 rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] text-[#6B7280] font-mono">
                          {g.shortCode}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[#6B7280]">{g.level ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#6B7280] font-mono">{g.externalId ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#6B7280] truncate max-w-[180px]">{g.description ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleStatusToggle(g)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          g.status === "ACTIVE"
                            ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                            : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                        }`}
                      >
                        {g.status}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setConfirmDelete(g)}
                        className="rounded-md border border-[#FEE2E2] px-2 py-1 text-[11px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              }
              {/* tree view */}
              {!loading && !filtered &&
                tree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node as any}
                    depth={0}
                    onStatusToggle={handleStatusToggle}
                    onDelete={setConfirmDelete}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                  />
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-[15px] font-semibold">Delete genre?</h2>
            <p className="mt-1.5 text-[13px] text-[#6B7280]">
              Delete <span className="font-medium text-[#111827]">{confirmDelete.name}</span>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-8 rounded-md border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#374151]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="h-8 rounded-md bg-[#EF4444] px-3 text-[12px] font-medium text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
