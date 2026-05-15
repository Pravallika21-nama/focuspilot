import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { updateTask } from "../services/api.js";
import { formatShortDate } from "../utils/date.js";

export default function TaskList({ tasks = [], onChange }) {
  async function toggle(task) {
    await updateTask(task._id, { completed: !task.completed });
    onChange?.();
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <div key={task._id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-3">
          <button
            onClick={() => toggle(task)}
            className={task.completed ? "text-mint" : "text-slate-400"}
            title={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-white">{task.subject}</p>
              <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100">{task.type}</span>
            </div>
            <p className="truncate text-sm text-slate-400">{task.topic}</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p className="flex items-center gap-1"><Clock3 size={13} /> {task.startTime}</p>
            <p>{formatShortDate(task.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
