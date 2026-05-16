import { BarChart3, BellRing, CalendarDays, LayoutDashboard, LogOut, Sparkles, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reminders", label: "Reminders", icon: BellRing },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const toast = useToast();

  function handleLogout() {
    logout();
    toast.info("Logged out. See you soon! 👋");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      {/* ── Sidebar ── */}
      <aside className="border-b border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur-2xl lg:min-h-screen lg:border-b-0 lg:border-r">
        {/* Brand */}
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 text-slate-950 shadow-lg">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">FocusPilot</p>
            <p className="text-xs text-slate-400">Smart exam cockpit</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="grid gap-1 sm:grid-cols-5 lg:grid-cols-1" aria-label="Main navigation">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-400/20 to-teal-400/10 text-cyan-300 border border-cyan-400/20"
                    : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/[0.05] p-4 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 text-xs font-bold text-slate-950">
              {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Student"}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-red-400"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
