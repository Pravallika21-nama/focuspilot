import { motion } from "framer-motion";
import { Bell, BellOff, Clock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { fetchReminderPrefs, saveReminderPrefs } from "../services/api.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function RemindersPage() {
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    reminderTime: "07:00",
    studyDays: [1, 2, 3, 4, 5],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReminderPrefs()
      .then((data) => setPrefs((prev) => ({ ...prev, ...data })))
      .catch(() => {
        /* use defaults silently */
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(dayIndex) {
    setPrefs((prev) => ({
      ...prev,
      studyDays: prev.studyDays.includes(dayIndex)
        ? prev.studyDays.filter((d) => d !== dayIndex)
        : [...prev.studyDays, dayIndex].sort(),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveReminderPrefs(prefs);
      toast.success("Reminder preferences saved!");
    } catch {
      toast.error("Failed to save preferences. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 text-slate-400 animate-pulse">
        Loading preferences…
      </div>
    );
  }

  return (
    <div className="grid gap-6 max-w-2xl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass rounded-xl p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Notification Settings
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Study Reminders</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Configure daily email reminders to keep your study streak alive.
        </p>
      </motion.header>

      {/* Email toggle */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                prefs.emailEnabled
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {prefs.emailEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </div>
            <div>
              <p className="font-semibold text-white">Email Reminders</p>
              <p className="text-xs text-slate-400">
                Receive daily study plan emails
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            id="reminder-email-toggle"
            onClick={() => setPrefs((p) => ({ ...p, emailEnabled: !p.emailEnabled }))}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              prefs.emailEnabled ? "bg-cyan-400" : "bg-white/10"
            }`}
            role="switch"
            aria-checked={prefs.emailEnabled}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                prefs.emailEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Reminder time */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className={`glass rounded-xl p-6 transition-opacity ${!prefs.emailEnabled ? "opacity-40 pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-400/15 text-indigo-300">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-semibold text-white">Reminder Time</p>
            <p className="text-xs text-slate-400">Daily email is sent at this time</p>
          </div>
        </div>

        <input
          id="reminder-time"
          type="time"
          value={prefs.reminderTime}
          onChange={(e) => setPrefs((p) => ({ ...p, reminderTime: e.target.value }))}
          className="input max-w-xs"
        />
        <p className="mt-2 text-xs text-slate-500">
          Times are in your local timezone. Server sends at configured UTC offset.
        </p>
      </motion.div>

      {/* Study days */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className={`glass rounded-xl p-6 transition-opacity ${!prefs.emailEnabled ? "opacity-40 pointer-events-none" : ""}`}
      >
        <p className="mb-4 font-semibold text-white">Study Days</p>
        <p className="mb-4 text-xs text-slate-400">Select the days you want to receive reminders.</p>

        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, i) => {
            const active = prefs.studyDays.includes(i);
            return (
              <button
                key={day}
                id={`reminder-day-${i}`}
                onClick={() => toggleDay(i)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400/30 hover:text-white"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {prefs.studyDays.length === 0
            ? "No days selected — reminders are paused."
            : `${prefs.studyDays.length} day${prefs.studyDays.length > 1 ? "s" : ""} selected`}
        </p>
      </motion.div>

      {/* Email preview */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="glass rounded-xl p-6"
      >
        <p className="mb-3 font-semibold text-white">Email Preview</p>
        <div className="rounded-lg border border-white/10 bg-slate-950/50 p-4 font-mono text-xs text-slate-300 leading-relaxed">
          <p className="text-slate-500">From: FocusPilot &lt;no-reply@focuspilot.app&gt;</p>
          <p className="text-slate-500">Subject: <span className="text-cyan-300">FocusPilot Study Reminder</span></p>
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-white font-semibold text-sm mb-1">📚 Good morning, Student!</p>
            <p className="text-slate-400">Stay consistent with your study goals today.</p>
            <p className="mt-2 text-slate-400">Here's your schedule for today:</p>
            <p className="mt-1 text-cyan-300">→ Mathematics · Calculus at 09:00</p>
            <p className="text-cyan-300">→ Physics · Mechanics at 11:00</p>
            <p className="mt-3 text-slate-500">Keep up the great work! — FocusPilot Team</p>
          </div>
        </div>
      </motion.div>

      {/* Save button */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
        <button
          id="reminder-save"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full sm:w-auto"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save Preferences"}
        </button>
      </motion.div>
    </div>
  );
}
