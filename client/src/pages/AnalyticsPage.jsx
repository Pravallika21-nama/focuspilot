import { Activity, BarChart3, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard.jsx";
import { fetchAnalytics } from "../services/api.js";
import { formatShortDate } from "../utils/date.js";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics().then(setAnalytics);
  }, []);

  const summary = analytics?.summary || {};

  return (
    <div className="grid gap-6">
      <header className="glass rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-white">Progress Analytics</h1>
        <p className="mt-2 text-slate-400">Accurate progress from your saved roadmap sessions.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Planned hours" value={summary.plannedHours || 0} />
        <StatCard icon={Trophy} label="Completed" value={`${summary.tasksCompleted || 0}/${summary.totalTasks || 0}`} />
        <StatCard icon={Activity} label="Remaining hours" value={summary.remainingHours || 0} />
        <StatCard icon={BarChart3} label="Finished" value={`${summary.completionPercent || 0}%`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-lg p-5">
          <p className="section-title">Daily Completion</p>
          <div className="mt-5 grid gap-3">
            {(analytics?.daily || []).map((row) => (
              <div key={row.date}>
                <div className="mb-1 flex justify-between gap-3 text-sm text-slate-400">
                  <span>{formatShortDate(row.date)} - {(row.subjects || []).join(", ") || "Study sessions"}</span>
                  <span>{roundHours(row.completedMinutes)}h / {roundHours(row.plannedMinutes)}h</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-cyan-300" style={{ width: `${row.completionPercent || 0}%` }} />
                </div>
              </div>
            ))}
            {!analytics?.daily?.length && <p className="rounded-lg bg-white/[0.05] p-4 text-sm text-slate-400">Generate a roadmap to see daily analytics.</p>}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <p className="section-title">Subject-wise Progress</p>
          <div className="mt-5 grid gap-4">
            {(analytics?.subjects || []).map((subject) => (
              <div key={subject.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-200">{subject.name}</span>
                  <span className="text-cyan-100">{subject.progress || 0}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-mint" style={{ width: `${subject.progress || 0}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {subject.completedHours || 0}h done, {subject.plannedHours || 0}h planned, {subject.remainingTasks || 0} sessions left
                </p>
              </div>
            ))}
            {!analytics?.subjects?.length && <p className="rounded-lg bg-white/[0.05] p-4 text-sm text-slate-400">No saved subjects yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function roundHours(minutes = 0) {
  return Math.round((Number(minutes || 0) / 60) * 10) / 10;
}
