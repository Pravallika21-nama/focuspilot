import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchActiveTimetable } from "../services/api.js";
import { formatShortDate, isSameDay } from "../utils/date.js";

export default function CalendarPage() {
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    fetchActiveTimetable().then((data) => setTimetable(data.timetable));
  }, []);

  const days = useMemo(() => Array.from({ length: 21 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  }), []);

  return (
    <div className="grid gap-6">
      <header className="glass rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-white">Calendar Sync</h1>
        <p className="mt-2 text-slate-400">Exam dates, study sessions, and completed tasks in one scan-friendly view.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {days.map((day) => {
          const sessions = timetable?.weeklySchedule?.filter((task) => isSameDay(task.date, day)) || [];
          const exams = timetable?.inputs?.subjects?.filter((subject) => subject.examDate && isSameDay(subject.examDate, day)) || [];
          return (
            <div key={day.toISOString()} className="min-h-36 rounded-lg border border-white/10 bg-white/[0.05] p-3">
              <p className="font-semibold text-white">{formatShortDate(day)}</p>
              <div className="mt-3 grid gap-2">
                {exams.map((exam) => <span key={exam.name} className="rounded-md bg-amber-300 px-2 py-1 text-xs font-semibold text-slate-950">{exam.name} exam</span>)}
                {sessions.map((session) => (
                  <span key={session._id} className="rounded-md bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                    {session.completed && <CheckCircle2 className="mr-1 inline" size={12} />} {session.startTime} {session.subject}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>
      {!timetable && (
        <p className="glass rounded-lg p-5 text-sm text-slate-300">
          Calendar is empty until you generate a BTech roadmap from your own subject details.
        </p>
      )}
    </div>
  );
}
