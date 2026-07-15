import { useMemo, useState, useEffect, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell, ChevronDown, ChevronRight, LogOut, Menu, Search as SearchIcon,
} from "lucide-react";
import { NAV, findNavLabel } from "./nav-config";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { hydrateAuth } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

export function AdminLayout({ children }: { children?: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) dispatch(hydrateAuth());
  }, []);

  if (!user) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  const crumb = findNavLabel(pathname);

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-[#111827]">
      <Sidebar open={sidebarOpen} pathname={pathname} />

      <div className={cn("flex min-w-0 flex-1 flex-col transition-[margin]", sidebarOpen ? "md:ml-64" : "md:ml-16")}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E5E7EB] bg-white/90 px-4 backdrop-blur">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-1.5 text-xs text-[#6B7280] md:flex">
            <span>BookAdmin</span>
            <ChevronRight className="h-3 w-3" />
            <span>{crumb?.group ?? "Admin"}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-[#111827]">{crumb?.label ?? "Page"}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, books, customers…"
                className="h-8 w-72 rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4F46E5]"
              />
            </div>
            <button className="relative rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
            </button>
            <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#9333EA] text-[11px] font-semibold text-white">
                {user.loginId.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-[12px] font-medium leading-tight">{user.loginId}</div>
                <div className="text-[10px] leading-tight text-[#6B7280]">{user.roles}</div>
              </div>
              <button onClick={() => { dispatch(logout()); navigate({ to: "/login" }); }} className="ml-1 rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#EF4444]" aria-label="Logout">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}

function Sidebar({ open, pathname }: { open: boolean; pathname: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV.forEach((g) => (init[g.label] = g.items.some((i) => pathname.startsWith(i.to))));
    init["Overview"] = true;
    return init;
  });

  const [filter, setFilter] = useState("");
  const groups = useMemo(() => {
    if (!filter.trim()) return NAV;
    const q = filter.toLowerCase();
    return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q) || g.label.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  }, [filter]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E5E7EB] bg-white transition-all duration-200",
        open ? "w-64" : "w-16",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-[#E5E7EB]", open ? "px-4" : "justify-center")}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md overflow-hidden">
          <img src="/koklogo.jpeg" alt="KOK Books" className="h-full w-full object-cover" />
        </div>
        {open && (
          <div className="ml-2.5">
            <div className="text-[13px] font-semibold leading-tight">BookAdmin</div>
            <div className="text-[10px] leading-tight text-[#6B7280]">Bookstore Backoffice</div>
          </div>
        )}
      </div>

      {open && (
        <div className="border-b border-[#E5E7EB] p-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Jump to…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-[#FAFAF9] pl-8 pr-2 text-[12px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4F46E5] focus:bg-white"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((g) => {
          const isOpen = expanded[g.label] ?? false;
          const Icon = g.icon;
          const activeInside = g.items.some((i) => pathname === i.to);
          return (
            <div key={g.label} className="px-2">
              <button
                onClick={() => open && setExpanded((s) => ({ ...s, [g.label]: !s[g.label] }))}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                  open ? "justify-between text-[#374151] hover:bg-[#F3F4F6]" : "justify-center text-[#6B7280] hover:text-[#111827]",
                  activeInside && "text-[#111827]",
                )}
                title={!open ? g.label : undefined}
              >
                <span className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", activeInside ? "text-[#4F46E5]" : "text-[#6B7280]")} />
                  {open && <span>{g.label}</span>}
                </span>
                {open && <ChevronDown className={cn("h-3 w-3 text-[#9CA3AF] transition-transform", isOpen && "rotate-180")} />}
              </button>
              {open && isOpen && (
                <div className="ml-6 mb-1 mt-0.5 border-l border-[#F3F4F6] pl-2">
                  {g.items.map((i) => {
                    const active = pathname === i.to;
                    return (
                      <Link
                        key={i.to}
                        to={i.to}
                        className={cn(
                          "block rounded-md px-2 py-1 text-[12px] transition-colors",
                          active
                            ? "bg-[#EEF2FF] font-medium text-[#4F46E5]"
                            : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]",
                        )}
                      >
                        {i.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {open && (
        <div className="border-t border-[#E5E7EB] p-3">
          <div className="rounded-md bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] p-3">
            <div className="text-[11px] font-semibold text-[#4F46E5]">Store status</div>
            <div className="mt-0.5 text-[10px] text-[#6B7280]">All systems operational</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[10px] text-[#374151]">Storefront online</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
