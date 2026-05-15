import { Download, Plus, Printer, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import TaskList from "../components/TaskList.jsx";
import { generateTimetable, getApiErrorMessage } from "../services/api.js";

const emptySubject = {
  name: "",
  examDate: "",
  difficulty: 3,
  priority: 3,
  isWeak: false,
  subjectType: "core",
  currentUnderstanding: 40,
  syllabusUnits: "",
  targetScore: 75
};

export default function PlannerPage() {
  const [subjects, setSubjects] = useState([{ ...emptySubject }]);
  const [form, setForm] = useState({
    branch: "",
    semester: "",
    academicGoal: "Pass with strong fundamentals",
    dailyStudyHours: 3,
    preferredStudyTime: "18:00",
    breakPreferences: "10 minutes after every 50 minutes",
    backlogs: "",
    learningStyle: "practice-first",
    currentPhase: "regular-semester"
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const validSubjects = subjects.filter((subject) => subject.name.trim());

    if (!form.branch || !form.semester || validSubjects.length === 0) {
      setError("Enter branch, semester, and at least one subject before asking AI to generate a roadmap.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const data = await generateTimetable({
        ...form,
        subjects: validSubjects,
        weakSubjects: validSubjects.filter((subject) => subject.isWeak).map((subject) => subject.name)
      });
      setPlan(data.timetable);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function updateSubject(index, patch) {
    setSubjects((items) => items.map((item, current) => (current === index ? { ...item, ...patch } : item)));
  }

  function removeSubject(index) {
    setSubjects((items) => items.length === 1 ? items : items.filter((_, current) => current !== index));
  }

  return (
    <div className="grid gap-6">
      <header className="glass rounded-lg p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">BTech AI Roadmap</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Enter your details, then ask AI for a plan</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          The AI analyzes your branch, semester, subject difficulty, syllabus units, backlogs, current understanding, exam dates, and daily availability.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={submit} className="glass grid gap-5 rounded-lg p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="BTech branch">
              <input className="input" placeholder="CSE, ECE, Mechanical, Civil..." value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} />
            </Field>
            <Field label="Semester">
              <input className="input" placeholder="1st, 3rd, 6th..." value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })} />
            </Field>
            <Field label="Academic goal">
              <input className="input" value={form.academicGoal} onChange={(event) => setForm({ ...form, academicGoal: event.target.value })} />
            </Field>
            <Field label="Current phase">
              <select className="input" value={form.currentPhase} onChange={(event) => setForm({ ...form, currentPhase: event.target.value })}>
                <option value="regular-semester">Regular semester</option>
                <option value="mid-semester">Mid semester</option>
                <option value="exam-preparation">Exam preparation</option>
                <option value="backlog-recovery">Backlog recovery</option>
                <option value="placement-preparation">Placement preparation</option>
              </select>
            </Field>
            <Field label="Daily study hours">
              <input className="input" type="number" min="1" max="12" value={form.dailyStudyHours} onChange={(event) => setForm({ ...form, dailyStudyHours: event.target.value })} />
            </Field>
            <Field label="Preferred study time">
              <input className="input" type="time" value={form.preferredStudyTime} onChange={(event) => setForm({ ...form, preferredStudyTime: event.target.value })} />
            </Field>
            <Field label="Learning style">
              <select className="input" value={form.learningStyle} onChange={(event) => setForm({ ...form, learningStyle: event.target.value })}>
                <option value="practice-first">Practice-first</option>
                <option value="concept-first">Concept-first</option>
                <option value="video-and-notes">Video and notes</option>
                <option value="revision-heavy">Revision-heavy</option>
              </select>
            </Field>
            <Field label="Break preference">
              <input className="input" value={form.breakPreferences} onChange={(event) => setForm({ ...form, breakPreferences: event.target.value })} />
            </Field>
          </div>

          <Field label="Backlogs or risky subjects">
            <textarea className="input min-h-20" placeholder="Example: Engineering Maths backlog, weak in DSA recursion..." value={form.backlogs} onChange={(event) => setForm({ ...form, backlogs: event.target.value })} />
          </Field>

          <div className="grid gap-3">
            <p className="section-title">Subjects</p>
            {subjects.map((subject, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="grid gap-2 sm:grid-cols-[1.2fr_0.8fr_0.75fr_0.75fr]">
                  <input className="input" placeholder="Subject name" value={subject.name} onChange={(event) => updateSubject(index, { name: event.target.value })} />
                  <input className="input" type="date" value={subject.examDate} onChange={(event) => updateSubject(index, { examDate: event.target.value })} />
                  <select className="input" value={subject.subjectType} onChange={(event) => updateSubject(index, { subjectType: event.target.value })}>
                    <option value="core">Core</option>
                    <option value="math">Math</option>
                    <option value="programming">Programming</option>
                    <option value="lab">Lab</option>
                    <option value="elective">Elective</option>
                    <option value="theory">Theory</option>
                  </select>
                  <button type="button" className="btn-muted px-3" onClick={() => removeSubject(index)} title="Remove subject">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  <label className="text-sm text-slate-300">Difficulty<input className="input mt-1" type="number" min="1" max="5" value={subject.difficulty} onChange={(event) => updateSubject(index, { difficulty: Number(event.target.value) })} /></label>
                  <label className="text-sm text-slate-300">Priority<input className="input mt-1" type="number" min="1" max="5" value={subject.priority} onChange={(event) => updateSubject(index, { priority: Number(event.target.value) })} /></label>
                  <label className="text-sm text-slate-300">Understanding %<input className="input mt-1" type="number" min="0" max="100" value={subject.currentUnderstanding} onChange={(event) => updateSubject(index, { currentUnderstanding: Number(event.target.value) })} /></label>
                  <label className="text-sm text-slate-300">Target %<input className="input mt-1" type="number" min="35" max="100" value={subject.targetScore} onChange={(event) => updateSubject(index, { targetScore: Number(event.target.value) })} /></label>
                </div>
                <textarea className="input min-h-16" placeholder="Syllabus units or important chapters" value={subject.syllabusUnits} onChange={(event) => updateSubject(index, { syllabusUnits: event.target.value })} />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={subject.isWeak} onChange={(event) => updateSubject(index, { isWeak: event.target.checked })} /> Mark as weak subject
                </label>
              </div>
            ))}
          </div>

          {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-muted" onClick={() => setSubjects([...subjects, { ...emptySubject }])}>
              <Plus size={16} /> Add Subject
            </button>
            <button className="btn-primary" disabled={loading}>
              <Sparkles size={16} /> {loading ? "Analyzing..." : "Ask AI To Generate Roadmap"}
            </button>
          </div>
        </form>

        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="section-title">AI Output</p>
            <div className="flex gap-2">
              <button className="btn-muted" onClick={() => window.print()} disabled={!plan}><Printer size={16} /> PDF</button>
              <button className="btn-muted" onClick={() => downloadPlan(plan)} disabled={!plan}><Download size={16} /> Download</button>
            </div>
          </div>
          {!plan && (
            <p className="rounded-lg bg-white/[0.05] p-4 text-sm leading-6 text-slate-400">
              No AI plan yet. Fill your student details and click "Ask AI To Generate Roadmap".
            </p>
          )}
          {plan && <TaskList tasks={plan.weeklySchedule || []} />}
        </div>
      </section>

      {plan && (
        <section className="grid gap-6 lg:grid-cols-3">
          <InfoPanel title="Subject Roadmap" items={plan.subjectRoadmap || []} />
          <InfoPanel title="Revision Plan" items={plan.revisionPlan || []} />
          <InfoPanel title="Productivity Suggestions" items={plan.suggestions || []} />
        </section>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm text-slate-300">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function InfoPanel({ title, items = [] }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="section-title">{title}</p>
      <ul className="mt-4 grid gap-2 text-sm text-slate-300">
        {items.map((item, index) => <li key={`${item}-${index}`} className="rounded-lg bg-white/[0.05] p-3">{item}</li>)}
      </ul>
    </div>
  );
}

function downloadPlan(plan) {
  if (!plan) return;
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "btech-ai-study-roadmap.json";
  link.click();
  URL.revokeObjectURL(url);
}
