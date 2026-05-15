import { motion } from "framer-motion";
import { BrainCircuit, Chrome, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../services/api.js";
import { sendFirebasePasswordReset } from "../services/firebase.js";

export default function AuthPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      setError("");
      setLoading(true);
      if (mode === "login") await login(form);
      else await register(form);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    try {
      setError("");
      await sendFirebasePasswordReset(form.email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-slate-950/70 shadow-glow backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-300 p-2 text-slate-950"><BrainCircuit size={28} /></div>
            <div>
              <h1 className="text-2xl font-semibold text-white">FocusPilot</h1>
              <p className="text-sm text-slate-400">Futuristic study scheduling for exam season</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg bg-white/5 p-1">
            <button className={`rounded-md py-2 text-sm font-semibold ${mode === "login" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`} onClick={() => setMode("login")}>Login</button>
            <button className={`rounded-md py-2 text-sm font-semibold ${mode === "signup" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`} onClick={() => setMode("signup")}>Signup</button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === "signup" && (
              <input className="input" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            )}
            <input className="input" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input className="input" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <button className="btn-primary" disabled={loading}><LockKeyhole size={16} /> {mode === "login" ? "Enter Dashboard" : "Create Account"}</button>
          </form>

          {error && <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}

          <button className="btn-muted mt-4 w-full" onClick={handleGoogleLogin} disabled={loading}>
            <Chrome size={16} /> Continue with Google
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Google login uses your own Gmail account. Study reminders are sent to the email verified by Google.
          </p>
          <button type="button" onClick={handleForgotPassword} className="mt-4 text-sm text-cyan-100 hover:text-cyan-50">Forgot password?</button>
        </div>

        <div className="bg-gradient-to-br from-cyan-300/18 via-slate-900 to-mint/20 p-8 sm:p-10">
          <div className="grid h-full content-center gap-5">
            {["AI-generated timetable", "15-minute smart reminders", "Calendar, progress, Pomodoro", "Internship-ready demo flow"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
}
