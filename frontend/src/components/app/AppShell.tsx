import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Coins,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Users,
  ClipboardList,
  Sun,
  Moon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import dasCoLogo from "@/assets/das-co-logo-full.png";

const nav = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/clients", label: "Clients", Icon: Users },
  { to: "/orders", label: "Orders", Icon: ClipboardList },
  { to: "/gold-vault", label: "Gold Vault", Icon: Coins },
  { to: "/expenses", label: "Expenses", Icon: Receipt },
  { to: "/reports", label: "Reports", Icon: FileText },
  { to: "/analytics", label: "Analytics", Icon: ChartNoAxesCombined },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays },
  { to: "/settings", label: "Settings", Icon: Settings },
] as const;

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const { theme, toggleTheme } = useTheme();

  const signOut = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate({ to: "/auth", replace: true });
    }
  };

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar fixed inset-y-0 left-0 z-40 hidden w-[265px] flex-col px-4 py-5 lg:flex">
        <div className="flex items-center gap-3 px-2 pb-5">
          <img src={dasCoLogo} alt="DAS & CO" className="h-12 w-12 shrink-0 object-contain" />
          <div>
            <div className="font-serif text-[1.35rem] tracking-[0.18em] text-[#d1ab55]">
              DAS <span>&amp;</span> CO
            </div>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.28em] text-[#857d74]">
              Jewellery CAD Studio
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, Icon }) => {
            const active =
              pathname === to ||
              (to === "/analytics" && pathname.startsWith("/analytics"));
            return (
              <Link
                key={to}
                to={to}
                data-active={active}
                className="studio-nav flex items-center gap-3 rounded-full px-4 py-3 text-sm"
              >
                <Icon size={17} strokeWidth={1.7} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="studio-nav flex items-center gap-3 rounded-full px-4 py-3 text-sm"
        >
          <LogOut size={17} strokeWidth={1.7} />
          Sign out
        </button>
      </aside>

      <div className="studio-main lg:pl-[265px]">
        <header className="studio-header sticky top-0 z-30 flex h-[63px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <p className="text-[0.67rem] uppercase tracking-[0.34em] text-[#a8a099]">
              Business Operating System
            </p>
            <span className="hidden text-[#4a4136] sm:inline">·</span>
            <a href="tel:9390673813" className="hidden text-[0.72rem] text-[#a8a099] hover:text-[#d1ab55] sm:inline">
              9390673813
            </a>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Toggle light / dark appearance"
              onClick={toggleTheme}
              className="rounded-full p-2 text-[#c5bdb5] transition hover:bg-white/5 hover:text-[#e9dfd2]"
            >
              {theme === "dark" ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}
            </button>
            <button
              type="button"
              aria-label="Sign out"
              onClick={signOut}
              className="rounded-full p-2 text-[#c5bdb5] transition hover:bg-white/5 hover:text-[#e9dfd2] lg:hidden"
            >
              <LogOut size={17} strokeWidth={1.7} />
            </button>
          </div>
        </header>

        <div className="px-5 py-7 sm:px-7 lg:px-8">
          <nav className="mb-5 flex gap-2 overflow-x-auto lg:hidden studio-scrollbar">
            {nav.map(({ to, label }) => {
              const active = pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs ${
                    active
                      ? "border-[#c7a34c]/40 bg-[#c7a34c]/10 text-[#d7b85e]"
                      : "border-[#32291f] text-[#8f877f]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
}
