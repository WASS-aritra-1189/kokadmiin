import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight,
  Boxes, TrendingUp, Truck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { login, clearError } from "@/store/slices/authSlice";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — KOK Books Admin" },
      { name: "description", content: "Staff sign-in for the KOK Books backoffice." },
    ],
  }),
});

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ loginId, password }));
    if (login.fulfilled.match(result)) {
      navigate({ to: "/dashboard", replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F7F5]">
      {/* Left — form */}
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:flex-none lg:w-[560px] lg:px-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shadow-sm">
              <img src="/koklogo.jpeg" alt="KOK Books" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[14px] font-semibold leading-tight">KOK Books Admin</div>
              <div className="text-[10.5px] leading-tight text-[#6B7280]">Bookstore backoffice</div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 w-full max-w-[380px] lg:mt-24">
          {error && (
            <div className="mb-3 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">
              {error}
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10.5px] font-medium text-[#4F46E5]">
            <Sparkles className="h-3 w-3" />
            Staff workspace · v2.4
          </div>
          <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-[#0F172A]">
            Welcome back.
          </h1>
          <p className="mt-1.5 text-[13px] text-[#6B7280]">
            Sign in to manage inventory, orders and shipments.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-3.5">
            <div>
              <label className="text-[11.5px] font-medium text-[#374151]">Phone / Email</label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-[#374151]">Password</label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-9 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-0.5 text-[11.5px] text-[#374151]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#4F46E5] focus:ring-[#4F46E5]"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#111827] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#1F2937] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in to workspace"}
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#9CA3AF]">
            By continuing you agree to the{" "}
            <a href="#" className="text-[#4F46E5] hover:underline">acceptable use policy</a>.
          </p>
        </div>

        <div className="mt-auto hidden items-center justify-between pt-8 text-[10.5px] text-[#9CA3AF] sm:flex">
          <div>© {new Date().getFullYear()} KOK Books · Bengaluru</div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-[#374151]">Status</a>
            <a href="#" className="hover:text-[#374151]">Docs</a>
            <a href="#" className="hover:text-[#374151]">Support</a>
          </div>
        </div>
      </div>

      {/* Right — hero */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1023] via-[#1E1B4B] to-[#4F46E5]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(1200px 400px at 20% 10%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(600px 400px at 80% 80%, rgba(147,51,234,0.35), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-14 text-white">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">
              Bookstore backoffice · India
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10.5px] text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              All systems operational
            </div>
          </div>

          <div>
            <h2 className="text-[42px] font-semibold leading-[1.05] tracking-tight">
              Ship books.
              <br />
              <span className="bg-gradient-to-r from-white to-[#A5B4FC] bg-clip-text text-transparent">
                Not spreadsheets.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-white/70">
              Inventory across warehouses, order routing, GST invoicing, courier AWBs, coupons and
              shelf-level reports — one calm surface for your whole team.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              <HeroStat icon={Boxes} value="12,481" label="books indexed" />
              <HeroStat icon={TrendingUp} value="₹12.8L" label="revenue / mo" />
              <HeroStat icon={Truck} value="4" label="warehouses" />
            </div>

            <div className="mt-10 max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-[11px] font-medium text-white/60">
                <Sparkles className="h-3.5 w-3.5 text-[#A5B4FC]" />
                What's new
              </div>
              <div className="mt-1.5 text-[13px] font-medium text-white">
                Multi-warehouse stock transfers with barcode scanning
              </div>
              <div className="mt-0.5 text-[11.5px] text-white/60">
                Move inventory between Bengaluru, Mumbai, Delhi and Kolkata with automatic GRN.
              </div>
            </div>
          </div>

          <div className="text-[10.5px] text-white/50">
            "Cut our end-of-day reconciliation from 90 minutes to under 10." — Meera S., Sapna Book House
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, value, label }: { icon: typeof Boxes; value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-[#A5B4FC]" />
      <div className="mt-1.5 text-[18px] font-semibold text-white">{value}</div>
      <div className="text-[10.5px] text-white/60">{label}</div>
    </div>
  );
}
