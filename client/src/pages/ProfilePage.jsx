import { BellRing, Mail, Save, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { requestNotificationPermission } from "../services/notifications.js";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState(user);

  function save() {
    localStorage.setItem("study_user", JSON.stringify(form));
    setUser(form);
  }

  return (
    <div className="grid gap-6">
      <header className="glass rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-white">User Profile</h1>
        <p className="mt-2 text-slate-400">Manage preferences used by the planner and reminders.</p>
      </header>

      <section className="glass grid gap-4 rounded-lg p-5 md:grid-cols-2">
        <label className="text-sm text-slate-300"><UserRound className="mb-2" size={18} /> Name<input className="input mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="text-sm text-slate-300"><Mail className="mb-2" size={18} /> Email<input className="input mt-1" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label className="text-sm text-slate-300">Daily study hours<input className="input mt-1" type="number" value={form.dailyStudyHours || 4} onChange={(event) => setForm({ ...form, dailyStudyHours: Number(event.target.value) })} /></label>
        <label className="text-sm text-slate-300">Preferred study time<input className="input mt-1" type="time" value={form.preferredStudyTime || "18:00"} onChange={(event) => setForm({ ...form, preferredStudyTime: event.target.value })} /></label>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button className="btn-primary" onClick={save}><Save size={16} /> Save Profile</button>
          <button className="btn-muted" onClick={requestNotificationPermission}><BellRing size={16} /> Enable Browser Notifications</button>
          <button className="btn-muted" onClick={logout}>Logout</button>
        </div>
      </section>
    </div>
  );
}
