import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Sparkles, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-xl lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="font-semibold text-white">FocusPilot</p>
            <p className="text-xs text-slate-400">Smart exam cockpit</p>
          </div>
        </div>

        <nav className="grid gap-2 sm:grid-cols-5 lg:grid-cols-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 hidden rounded-lg border border-white/10 bg-white/5 p-4 lg:block">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <button onClick={logout} className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
