import { motion } from "framer-motion";
import { BrainCircuit, Chrome, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getApiErrorMessage } from "../services/api.js";
import { sendFirebasePasswordReset } from "../services/firebase.js";

const heroFeatures = [
  { emoji: "📅", label: "Plan smarter", desc: "AI-powered roadmaps built for your syllabus" },
  { emoji: "⏰", label: "Stay consistent", desc: "Daily reminders keep you on schedule" },
  { emoji: "🚀", label: "Achieve goals", desc: "Pomodoro, analytics & progress tracking" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function AuthPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      if (mode === "login") {
        await login(form);
        toast.success("Welcome back! Redirecting…");
      } else {
        await register(form);
        toast.success("Account created! Welcome to FocusPilot 🎉");
      }
      navigate("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Signed in with Google!");
      navigate("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!form.email) {
      toast.warning("Enter your email address first.");
      return;
    }
    try {
      await sendFirebasePasswordReset(form.email);
      toast.info("Password reset email sent — check your inbox.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-glow backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]"
      >
        {/* ── Left: Auth Form ── */}
        <div className="p-8 sm:p-10">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 text-slate-950 shadow-lg">
              <BrainCircuit size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">FocusPilot</h1>
              <p className="text-xs font-medium text-slate-400">Smart study planner for students</p>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1">
            {["login", "signup"].map((tab) => (
              <button
                key={tab}
                id={`auth-tab-${tab}`}
                onClick={() => setMode(tab)}
                className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
                  mode === tab
                    ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="grid gap-3.5">
            {mode === "signup" && (
              <input
                id="auth-name"
                className="input"
                placeholder="Full name"
                value={form.name}
                onChange={field("name")}
                required
                autoComplete="name"
              />
            )}
            <input
              id="auth-email"
              className="input"
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={field("email")}
              required
              autoComplete="email"
            />
            <div className="relative">
              <input
                id="auth-password"
                className="input pr-10"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={field("password")}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              id="auth-submit"
              className="btn-primary mt-1"
              disabled={loading}
            >
              <LockKeyhole size={16} />
              {loading ? "Please wait…" : mode === "login" ? "Enter Dashboard" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google */}
          <button
            id="auth-google"
            className="btn-muted w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome size={16} />
            Continue with Google
          </button>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Google sign-in uses your Gmail account. Reminders will be sent to your verified email.
          </p>

          {/* Forgot password */}
          <button
            type="button"
            id="auth-forgot"
            onClick={handleForgotPassword}
            className="mt-4 text-xs text-cyan-400 underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* ── Right: Hero Panel ── */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center">
          {/* Animated background orbs */}
          <div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.45) 0%, transparent 70%)",
              animation: "orbFloat 7s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(45,212,191,0.5) 0%, transparent 70%)",
              animation: "orbFloat 9s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)",
              animation: "orbFloat 11s ease-in-out infinite",
            }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/8 via-slate-900/70 to-teal-400/10" />

          {/* Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative z-10 p-10"
          >
            {/* Hero heading */}
            <motion.div variants={fadeUp} className="mb-8">
              <h2
                className="text-4xl font-extrabold leading-tight tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #22d3ee 0%, #2dd4bf 50%, #818cf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                FocusPilot
              </h2>
              <p className="mt-2 text-base font-medium text-slate-300">
                Smart study planner for students
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xs">
                Turn your syllabus into a structured roadmap. Get daily reminders, track progress, and ace your exams.
              </p>
            </motion.div>

            {/* Feature pills */}
            <div className="grid gap-3">
              {heroFeatures.map((feat) => (
                <motion.div
                  key={feat.label}
                  variants={fadeUp}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.09] bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-200 hover:border-cyan-400/30 hover:bg-white/[0.09]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xl">
                    {feat.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{feat.label}</p>
                    <p className="text-xs text-slate-400">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tagline */}
            <motion.p
              variants={fadeUp}
              className="mt-8 text-xs font-medium tracking-widest uppercase text-cyan-400/70"
            >
              Built for serious students ✦
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Orb animation keyframes */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.06); }
        }
      `}</style>
    </main>
  );
}
