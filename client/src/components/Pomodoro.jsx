import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Pomodoro() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const label = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const rest = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  }, [seconds]);

  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Pomodoro</p>
          <p className="text-sm text-slate-400">25-minute focus sprint</p>
        </div>
        <p className="text-3xl font-semibold text-cyan-100">{label}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn-primary" onClick={() => setRunning((value) => !value)}>
          {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Pause" : "Start"}
        </button>
        <button className="btn-muted" onClick={() => { setRunning(false); setSeconds(25 * 60); }}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
