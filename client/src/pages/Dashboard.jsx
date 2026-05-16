import { BarChart3, BellRing, BookOpenCheck, CalendarClock, CheckSquare, Clock3, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ChatAssistant from "../components/ChatAssistant.jsx";
import Pomodoro from "../components/Pomodoro.jsx";
import StatCard from "../components/StatCard.jsx";
import TaskList from "../components/TaskList.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchActiveTimetable, fetchAnalytics } from "../services/api.js";
import { notifyBeforeSessions } from "../services/notifications.js";
import { daysUntil, formatShortDate, isSameDay } from "../utils/date.js";

// ──────────────────────────────────────────────────────────
// Daily Goals — stored in localStorage (no backend needed)
// ──────────────────────────────────────────────────────────
const GOALS_KEY = "fp_daily_goals";

function loadGoals() {
  try {
    const stored = JSON.parse(localStorage.getItem(GOALS_KEY) || "null");
    const today = new Date().toDateString();
    if (stored?.date === today) return stored.goals;
  } catch {}
  return [
    { id: 1, text: "Complete today's study session", done: false },
    { id: 2, text: "Review yesterday's notes", done: false },
    { id: 3, text: "Practice 10 problems", done: false },
  ];
}

function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify({ date: new Date().toDateString(), goals }));
}

function DailyGoals() {
  const [goals, setGoals] = useState(loadGoals);
  const [newGoal, setNewGoal] = useState("");

  function toggleGoal(id) {
    const updated = goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    setGoals(updated);
    saveGoals(updated);
  }

  function addGoal(e) {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const updated = [...goals, { id: Date.now(), text: newGoal.trim(), done: false }];
    setGoals(updated);
    saveGoals(updated);
    setNewGoal("");
  }

  const doneCount = goals.filter((g) => g.done).length;
  const pct = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;

  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="section-title flex items-center gap-2">
          <Target size={18} className="text-cyan-300" />
          Daily Goals
        </p>
        <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
          {doneCount}/{goals.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="grid gap-2">
        {goals.map((goal) => (
          <li key={goal.id}>
            <button
              onClick={() => toggleGoal(goal.id)}
              className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm transition-all ${
                goal.done
                  ? "bg-emerald-400/10 text-slate-400 line-through"
                  : "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
              }`}
            >
              <CheckSquare
                size={16}
                className={goal.done ? "text-emerald-400" : "text-slate-500"}
              />
              {goal.text}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addGoal} className="mt-3 flex gap-2">
        <input
          className="input flex-1 py-2 text-xs"
          placeholder="Add a goal for today…"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          maxLength={80}
        />
        <button type="submit" className="btn-primary py-2 px-3 text-xs">
          +
        </button>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Weekly completion mini-chart
// ──────────────────────────────────────────────────────────
function WeekChart({ tasks }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();

  const bars = days.map((label, i) => {
    const target = new Date(now);
    const dayOfWeek = now.getDay(); // 0=Sun
    const offset = i + 1 - dayOfWeek; // Mon=1
    target.setDate(now.getDate() + offset);

    const dayTasks = tasks.filter((t) => isSameDay(t.date, target));
    const done = dayTasks.filter((t) => t.completed).length;
    const total = dayTasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const isToday = offset === 0;

    return { label, done, total, pct, isToday };
  });

  return (
    <div className="glass rounded-xl p-5">
      <p className="section-title mb-4">This Week's Progress</p>
      <div className="flex items-end gap-2 h-24">
        {bars.map(({ label, pct, total, done, isToday }) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500">{done}/{total}</span>
            <div className="relative w-full flex-1 rounded-lg bg-white/[0.06]">
              <div
                className={`absolute bottom-0 w-full rounded-lg transition-all duration-700 ${
                  isToday
                    ? "bg-gradient-to-t from-cyan-400 to-teal-300"
                    : "bg-gradient-to-t from-cyan-400/40 to-teal-300/40"
                }`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${isToday ? "text-cyan-300" : "text-slate-500"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [planData, analyticsData] = await Promise.all([fetchActiveTimetable(), fetchAnalytics()]);
    setTimetable(planData.timetable);
    setAnalytics(analyticsData);
    notifyBeforeSessions(planData.timetable?.weeklySchedule || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const tasks = timetable?.weeklySchedule || [];
  const subjects = timetable?.inputs?.subjects || [];
  const summary = analytics?.summary || {};

  const todayTasks = tasks.filter((t) => isSameDay(t.date, new Date())).slice(0, 5);
  const tomorrowTasks = tasks.filter((t) => isSameDay(t.date, addDays(1))).slice(0, 5);
  const revisionTasks = tasks
    .filter((t) => !t.completed && ["revision", "practice", "study"].includes(t.type))
    .slice(0, 6);
  const nearestExam = subjects
    .filter((s) => s.examDate)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0];

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass h-24 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="grid gap-6">
        <header className="glass rounded-xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            FocusPilot Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Welcome, {user.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Your dashboard will fill with subject progress, revision tasks, Pomodoro timer, and
            analytics after you generate a study roadmap.
          </p>
          <Link to="/planner" id="dashboard-generate-roadmap" className="btn-primary mt-5 inline-flex">
            <Sparkles size={16} /> Generate My Roadmap
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <DailyGoals />
          <Pomodoro />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <header className="glass rounded-xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Saved BTech Roadmap
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          {timetable.inputs?.branch || "BTech"} · Semester {timetable.inputs?.semester || "Plan"}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          {timetable.inputs?.academicGoal ||
            "Your personalized roadmap is stored and updates as you complete tasks."}
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpenCheck} label="Subjects" value={subjects.length} hint="Loaded from roadmap" />
        <StatCard
          icon={BarChart3}
          label="Finished"
          value={`${summary.completionPercent || 0}%`}
          hint={`${summary.tasksCompleted || 0}/${summary.totalTasks || tasks.length} tasks`}
        />
        <StatCard
          icon={Clock3}
          label="Remaining"
          value={summary.remainingTasks || tasks.filter((t) => !t.completed).length}
          hint="Sessions left"
        />
        <StatCard
          icon={BellRing}
          label="Next Exam"
          value={nearestExam ? `${Math.max(0, daysUntil(nearestExam.examDate))} days` : "N/A"}
          hint={nearestExam?.name || "Add exam dates"}
        />
      </section>

      {/* Week chart + Daily goals */}
      <section className="grid gap-6 xl:grid-cols-2">
        <WeekChart tasks={tasks} />
        <DailyGoals />
      </section>

      {/* Subjects + Pomodoro */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Subjects To Revise">
          <div className="grid gap-3">
            {subjects.map((subject) => (
              <div key={subject.name} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{subject.name}</p>
                    <p className="text-xs text-slate-400">
                      {subject.isWeak ? "Weak subject" : subject.subjectType || "Subject"} · Target{" "}
                      {subject.targetScore || 75}%
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                    {subjectProgress(tasks, subject.name)}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
                    style={{ width: `${subjectProgress(tasks, subject.name)}%` }}
                  />
                </div>
                {subject.examDate && (
                  <p className="mt-2 text-xs text-slate-500">Exam: {formatShortDate(subject.examDate)}</p>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <Pomodoro />
      </section>

      {/* Today / Tomorrow */}
      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Today's Revision">
          {todayTasks.length ? (
            <TaskList tasks={todayTasks} onChange={load} />
          ) : (
            <EmptyLine text="No sessions scheduled for today." />
          )}
        </Panel>
        <Panel title="Tomorrow's Plan">
          {tomorrowTasks.length ? (
            <TaskList tasks={tomorrowTasks} onChange={load} />
          ) : (
            <EmptyLine text="No sessions scheduled for tomorrow." />
          )}
        </Panel>
      </section>

      {/* Remaining + Chat */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Remaining Roadmap">
          {revisionTasks.length ? (
            <TaskList tasks={revisionTasks} onChange={load} />
          ) : (
            <EmptyLine text="All current roadmap sessions are complete. 🎉" />
          )}
        </Panel>
        <ChatAssistant />
      </section>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────

function Panel({ title, children }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="section-title">{title}</p>
        <CalendarClock className="text-cyan-200" size={18} />
      </div>
      {children}
    </div>
  );
}

function EmptyLine({ text }) {
  return <p className="rounded-lg bg-white/[0.04] p-4 text-sm text-slate-400">{text}</p>;
}

function subjectProgress(tasks, subjectName) {
  const st = tasks.filter((t) => t.subject === subjectName);
  if (!st.length) return 0;
  return Math.round((st.filter((t) => t.completed).length / st.length) * 100);
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
