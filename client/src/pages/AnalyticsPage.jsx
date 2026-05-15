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
        <p className="mt-2 text-slate-400">Track hours, consistency, focus, and subject progress.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Weekly hours" value={summary.weeklyHours || 0} />
        <StatCard icon={Trophy} label="Tasks done" value={summary.tasksCompleted || 0} />
        <StatCard icon={Activity} label="Consistency" value={`${summary.consistency || 0}%`} />
        <StatCard icon={BarChart3} label="Focus score" value={`${summary.averageFocus || 0}%`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-lg p-5">
          <p className="section-title">Study Hours Graph</p>
          <div className="mt-5 grid gap-3">
            {(analytics?.daily || []).map((row) => (
              <div key={`${row.date}-${row.subject}`}>
                <div className="mb-1 flex justify-between text-sm text-slate-400">
                  <span>{formatShortDate(row.date)} · {row.subject}</span>
                  <span>{Math.round(row.completedMinutes / 60 * 10) / 10}h</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-cyan-300" style={{ width: `${Math.min(100, row.completedMinutes)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <p className="section-title">Subject-wise Progress</p>
          <div className="mt-5 grid gap-4">
            {(analytics?.subjects || []).map((subject) => (
              <div key={subject.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-200">{subject.name}</span>
                  <span className="text-cyan-100">{subject.progress || 50}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-mint" style={{ width: `${subject.progress || 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
