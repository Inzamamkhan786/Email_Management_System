import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ChevronDown, ChevronLeft, Paperclip, Star } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { ClassBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import { formatFull, PRIORITY_META } from "../../lib/format";
import { useUi } from "../../store/ui";
import Modal from "../../components/common/Modal";

export default function Conversation({ clientMode }) {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const setComposer = useUi((s) => s.setComposer);
  const setAiOpen = useUi((s) => s.setAiOpen);
  const [expanded, setExpanded] = useState(false);
  const [why, setWhy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => (await api.get(`/conversations/${id}`)).data.conversation,
  });

  const patch = useMutation({
    mutationFn: (body) => api.patch(`/conversations/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversation", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["metrics"] });
      toast.success("Updated");
    },
  });

  const clientAction = useMutation({
    mutationFn: (kind) => api.post(`/client/attention/${id}/${kind}`),
    onSuccess: (_, kind) => {
      qc.invalidateQueries();
      toast.success(kind === "handled" ? "Marked as handled" : "Assistant will take this");
      navigate("/c");
    },
  });

  const c = data;
  const messages = c?.messages || [];
  const latest = messages[messages.length - 1];
  const older = messages.slice(0, -1);
  const conf = Math.round((c?.analysis?.confidence || 0) * 100);

  const back = clientMode ? "/c" : "/app/inbox/all";

  if (isLoading || !c) {
    return <div className="p-8 text-[13px] text-muted">Loading conversation…</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-3">
          <Link to={back} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
            <ChevronLeft size={16} /> Back
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-[16px] font-semibold">{c.subject}</h1>
          <ClassBadge value={c.classification} />
          <span className={`text-[12px] ${PRIORITY_META[c.priority]?.className}`}>{c.priority}</span>
          {!clientMode && (
            <>
              <button
                onClick={() => patch.mutate({ important: !c.important })}
                className={`rounded-md p-1.5 ${c.important ? "text-warn" : "text-muted hover:bg-quiet"}`}
              >
                <Star size={16} />
              </button>
              <button onClick={() => patch.mutate({ archived: true })} className="rounded-md p-1.5 text-muted hover:bg-quiet">
                <Archive size={16} />
              </button>
            </>
          )}
        </div>

        <div className="px-4 py-4 md:px-8">
          {older.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mb-4 flex items-center gap-2 text-[12px] text-muted"
            >
              <ChevronDown size={14} className={expanded ? "rotate-180" : ""} />
              {expanded ? "Hide earlier messages" : `${older.length} earlier message${older.length > 1 ? "s" : ""}`}
            </button>
          )}
          {(expanded ? messages : [latest]).filter(Boolean).map((m, idx) => (
            <article key={m.id || idx} className="mb-6 border-b border-line pb-6">
              <div className="mb-3 flex items-start gap-3">
                <Avatar name={m.from?.name} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[14px] font-medium">{m.from?.name}</span>
                    <span className="text-[12px] text-muted">{m.from?.email}</span>
                    <span className="ml-auto text-[12px] text-muted">{formatFull(m.sentAt)}</span>
                  </div>
                  <p className="text-[12px] text-muted">To {m.to?.map((t) => t.name).join(", ") || "me"}</p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-ink">{m.body}</p>
              {m.attachments?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.attachments.map((a) => (
                    <span key={a.name} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px]">
                      <Paperclip size={12} /> {a.name} · {a.size}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
          {!clientMode && (
            <>
              <Button onClick={() => setComposer({ conversationId: c._id })}>Draft reply</Button>
              <Button variant="secondary" onClick={() => patch.mutate({ unread: true })}>
                Mark unread
              </Button>
              <Button variant="secondary" onClick={() => patch.mutate({ status: "completed" })}>
                Mark completed
              </Button>
              <Button variant="secondary" onClick={() => patch.mutate({ classification: "CLIENT_TO_REPLY" })}>
                Request client attention
              </Button>
              <Button variant="secondary" onClick={() => patch.mutate({ classification: "ASSISTANT_TO_REPLY" })}>
                Assign to assistant
              </Button>
              <select
                className="h-9 rounded-md border border-line bg-surface px-2 text-[13px]"
                value={c.classification}
                onChange={(e) => patch.mutate({ classification: e.target.value })}
              >
                <option value="ASSISTANT_TO_REPLY">Assistant to Reply</option>
                <option value="CLIENT_TO_REPLY">Client to Reply</option>
                <option value="NO_REPLY_NEEDED">No Reply Needed</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
              </select>
            </>
          )}
          {clientMode && (
            <>
              <Button onClick={() => clientAction.mutate("handled")} loading={clientAction.isPending}>
                I'll handle this
              </Button>
              <Button variant="secondary" onClick={() => clientAction.mutate("assign-assistant")}>
                Assistant, please handle
              </Button>
            </>
          )}
        </div>
      </div>

      <aside className="w-full shrink-0 border-t border-line bg-surface lg:w-[300px] lg:border-l lg:border-t-0">
        <div className="px-4 py-4">
          <h2 className="text-[16px] font-semibold">AI intelligence</h2>
          {c.analysis?.mock && <p className="mt-1 text-[11px] text-muted">Mock AI · no LLM key</p>}
        </div>
        <section className="border-t border-line px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Summary</h3>
          <p className="mt-2 text-[13px] leading-6">{c.analysis?.summary}</p>
        </section>
        <section className="border-t border-line px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Why it matters</h3>
          <p className="mt-2 text-[13px] leading-6">{c.analysis?.reason}</p>
          <button onClick={() => setWhy(true)} className="mt-2 text-[12px] text-accent">
            Why this classification?
          </button>
        </section>
        <section className="border-t border-line px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Responsibility</h3>
          <div className="mt-2">
            <ClassBadge value={c.classification} />
          </div>
          {c.analysis?.overridden && (
            <p className="mt-2 text-[11px] text-muted">
              Manually set by {c.analysis.overriddenBy}. Incoming AI will not overwrite this.
            </p>
          )}
        </section>
        <section className="border-t border-line px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Confidence</h3>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-quiet">
            <div className="h-full bg-accent" style={{ width: `${conf}%` }} />
          </div>
          <p className="mt-1 text-[12px] tabular-nums text-muted">
            {conf}% {conf < 70 ? "· below review threshold" : conf < 90 ? "· moderate" : "· auto-classified"}
          </p>
        </section>
        <section className="border-t border-line px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Recommended action</h3>
          <p className="mt-2 text-[13px] leading-6">{c.analysis?.suggestedAction}</p>
        </section>
        <section className="border-t border-line px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Extracted</h3>
          <ul className="mt-2 space-y-1 text-[13px]">
            {c.analysis?.deadline && <li>Deadline: {c.analysis.deadline}</li>}
            {c.analysis?.meeting && <li>Meeting: {c.analysis.meeting.title || c.subject}</li>}
            {c.priority && <li>Priority: {c.priority}</li>}
            {c.analysis?.category && <li>Category: {c.analysis.category.replaceAll("_", " ")}</li>}
          </ul>
        </section>
        {!clientMode && (
          <div className="border-t border-line px-4 py-3">
            <Button variant="secondary" className="w-full" onClick={() => setAiOpen(true)}>
              Ask about this thread
            </Button>
          </div>
        )}
      </aside>

      {why && (
        <Modal title="Why this classification?" onClose={() => setWhy(false)}>
          <p className="text-[13px] leading-6">{c.analysis?.reason}</p>
          <p className="mt-3 text-[12px] font-medium">Evidence from the thread</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-[13px] text-muted">
            {(c.analysis?.evidence || []).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-muted">Confidence {conf}%. Next: {c.analysis?.suggestedAction}</p>
        </Modal>
      )}
    </div>
  );
}
