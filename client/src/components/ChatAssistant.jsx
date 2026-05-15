import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { askAssistant } from "../services/api.js";

export default function ChatAssistant() {
  const [message, setMessage] = useState("How should I revise weak subjects this week?");
  const [answer, setAnswer] = useState("Ask for a study strategy, revision plan, or exam-week prioritization.");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    const data = await askAssistant(message);
    setAnswer(data.answer);
    setLoading(false);
  }

  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center gap-2">
        <Bot className="text-cyan-200" size={20} />
        <p className="section-title">AI Coach</p>
      </div>
      <p className="mt-3 rounded-lg bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">{answer}</p>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input className="input" value={message} onChange={(event) => setMessage(event.target.value)} />
        <button className="btn-primary" disabled={loading} title="Send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
