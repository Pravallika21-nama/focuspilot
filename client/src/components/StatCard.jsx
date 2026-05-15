import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className="rounded-lg bg-cyan-300/15 p-2 text-cyan-200">
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}
