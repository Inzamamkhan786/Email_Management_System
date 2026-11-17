import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useUi } from "../../store/ui";
import Button from "../common/Button";

const chips = [
  "Which emails need my attention today?",
  "Which emails require the client's response?",
  "What conversations are waiting for a reply?",
  "What deadlines are approaching?",
];

export default function AiPanel({ conversationId }) {
  const open = useUi((s) => s.aiOpen);
  const setAiOpen = useUi((s) => s.setAiOpen);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const ask = useMutation({
    mutationFn: async (question) => {
      const { data } = await api.post("/ai/ask", { question, conversationId });
      return { question, ...data };
    },
    onSuccess: (data) => {
      setMessages((m) => [...m, { role: "user", text: data.question }, { role: "ai", text: data.text, refs: data.refs, mock: data.mode?.mock }]);
    },
  });

  if (!open) return null;

  const send = (q) => {
    const question = (q || input).trim();
    if (!question) return;
    setInput("");
    ask.mutate(question);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button className="absolute inset-0 bg-black/30 md:bg-transparent" onClick={() => setAiOpen(false)} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-surface">
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2 text-[14px] font-semibold">
            <Sparkles size={16} />
            MailPilot AI
          </div>
          <button onClick={() => setAiOpen(false)} className="rounded-md p-1 text-muted hover:bg-quiet">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-[13px] text-muted">
              Ask about attention items, client decisions, waiting threads, or draft language. Answers use this workspace’s live inbox data.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "ml-8 rounded-md bg-quiet px-3 py-2 text-[13px]" : "mr-4 text-[13px] leading-6"}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.refs?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {m.refs.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setAiOpen(false);
                        navigate(`/app/mail/${r.id}`);
                      }}
                      className="rounded-md border border-line px-2 py-1 text-left text-[12px] hover:bg-quiet"
                    >
                      {r.subject}
                    </button>
                  ))}
                </div>
              )}
              {m.mock && <p className="mt-1 text-[11px] text-muted">Mock AI · no LLM key configured</p>}
            </div>
          ))}
          {ask.isPending && <p className="text-[12px] text-muted">Thinking…</p>}
        </div>
        <div className="border-t border-line p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:text-ink"
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about this inbox"
              className="h-10 flex-1 rounded-md border border-line bg-bg px-3 text-[13px]"
            />
            <Button onClick={() => send()} loading={ask.isPending}>
              Send
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
