import { BarChart3, BellRing, BookOpenCheck, CalendarClock, Clock3, Sparkles } from "lucide-react";
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

  useEffect(() => {
    load();
  }, []);

  const tasks = timetable?.weeklySchedule || [];
  const subjects = timetable?.inputs?.subjects || [];
  const summary = analytics?.summary || {};

  const todayTasks = tasks.filter((task) => isSameDay(task.date, new Date())).slice(0, 5);
  const tomorrowTasks = tasks.filter((task) => isSameDay(task.date, addDays(1))).slice(0, 5);
  const revisionTasks = tasks.filter((task) => !task.completed && ["revision", "practice", "study"].includes(task.type)).slice(0, 6);
  const nearestExam = subjects
    .filter((subject) => subject.examDate)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0];

  if (loading) {
    return <div className="glass rounded-lg p-6 text-slate-300">Loading your saved roadmap...</div>;
  }

  if (!timetable) {
    return (
      <div className="grid gap-6">
        <header className="glass rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">FocusPilot dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome, {user.name?.split(" ")[0] || "student"}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Your dashboard will fill with subject progress, revision tasks, next-day sessions, and course completion after you generate a roadmap.
          </p>
          <Link to="/planner" className="btn-primary mt-5">
            <Sparkles size={16} /> Generate My Roadmap
          </Link>
        </header>
        <Pomodoro />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="glass rounded-lg p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">Saved BTech roadmap</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {timetable.inputs?.branch || "BTech"} · Semester {timetable.inputs?.semester || "plan"}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          {timetable.inputs?.academicGoal || "Your personalized roadmap is stored at the backend and updates as you complete tasks."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpenCheck} label="Subjects saved" value={subjects.length} hint="Loaded from backend" />
        <StatCard icon={BarChart3} label="Finished" value={`${summary.completionPercent || 0}%`} hint={`${summary.tasksCompleted || 0}/${summary.totalTasks || tasks.length} tasks`} />
        <StatCard icon={Clock3} label="Course left" value={summary.remainingTasks || tasks.filter((task) => !task.completed).length} hint="Sessions remaining" />
        <StatCard icon={BellRing} label="Next exam" value={nearestExam ? `${Math.max(0, daysUntil(nearestExam.examDate))} days` : "N/A"} hint={nearestExam?.name || "Add exam dates"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Subjects To Revise">
          <div className="grid gap-3">
            {subjects.map((subject) => (
              <div key={subject.name} className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{subject.name}</p>
                    <p className="text-sm text-slate-400">
                      {subject.isWeak ? "Weak subject" : subject.subjectType || "Subject"} · Target {subject.targetScore || 75}%
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                    {subjectProgress(tasks, subject.name)}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${subjectProgress(tasks, subject.name)}%` }} />
                </div>
                {subject.examDate && <p className="mt-2 text-xs text-slate-500">Exam: {formatShortDate(subject.examDate)}</p>}
              </div>
            ))}
          </div>
        </Panel>

        <Pomodoro />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Today's Revision">
          {todayTasks.length ? <TaskList tasks={todayTasks} onChange={load} /> : <EmptyLine text="No sessions scheduled for today." />}
        </Panel>
        <Panel title="Tomorrow's Plan">
          {tomorrowTasks.length ? <TaskList tasks={tomorrowTasks} onChange={load} /> : <EmptyLine text="No sessions scheduled for tomorrow." />}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Remaining Roadmap">
          {revisionTasks.length ? <TaskList tasks={revisionTasks} onChange={load} /> : <EmptyLine text="All current roadmap sessions are complete." />}
        </Panel>
        <ChatAssistant />
      </section>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="section-title">{title}</p>
        <CalendarClock className="text-cyan-200" size={20} />
      </div>
      {children}
    </div>
  );
}

function EmptyLine({ text }) {
  return <p className="rounded-lg bg-white/[0.05] p-4 text-sm text-slate-400">{text}</p>;
}

function subjectProgress(tasks, subjectName) {
  const subjectTasks = tasks.filter((task) => task.subject === subjectName);
  if (!subjectTasks.length) return 0;
  return Math.round((subjectTasks.filter((task) => task.completed).length / subjectTasks.length) * 100);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
