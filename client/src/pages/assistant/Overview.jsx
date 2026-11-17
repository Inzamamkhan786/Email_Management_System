import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { greeting, formatTime } from "../../lib/format";
import { ClassBadge } from "../../components/common/Badge";
import EmailRow from "../../components/email/EmailRow";

function Stat({ label, value, hint }) {
  return (
    <div className="border-r border-line px-4 py-3 last:border-r-0">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-1 text-[22px] font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export default function Overview() {
  const user = useAuth((s) => s.user);
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => (await api.get("/metrics")).data,
  });
  const { data: attention } = useQuery({
    queryKey: ["conversations", "assistant"],
    queryFn: async () => (await api.get("/conversations", { params: { segment: "assistant" } })).data.conversations,
  });
  const { data: feed } = useQuery({
    queryKey: ["activity"],
    queryFn: async () => (await api.get("/activity")).data,
  });
  const { data: meetings } = useQuery({
    queryKey: ["conversations", "meetings"],
    queryFn: async () => (await api.get("/conversations", { params: { segment: "meetings" } })).data.conversations,
  });
  const { data: follow } = useQuery({
    queryKey: ["conversations", "waiting"],
    queryFn: async () => (await api.get("/conversations", { params: { segment: "waiting" } })).data.conversations,
  });

  const needs = (attention || []).slice(0, 6);
  const upcoming = (meetings || []).filter((c) => c.analysis?.meeting).slice(0, 4);

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="border-b border-line px-5 py-5">
          <h1 className="text-[24px] font-semibold tracking-tight">
            {greeting()}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[13px] text-muted">Here's what's happening across your clients' inboxes.</p>
        </div>
        <div className="grid grid-cols-2 border-b border-line md:grid-cols-5">
          <Stat label="Total emails" value={metrics?.total ?? "—"} />
          <Stat label="Unread" value={metrics?.unread ?? "—"} />
          <Stat label="Assistant actions" value={metrics?.assistant ?? "—"} hint="Assigned to you" />
          <Stat label="Client attention" value={metrics?.client ?? "—"} hint="Waiting on a decision" />
          <Stat label="Waiting" value={metrics?.waiting ?? "—"} />
        </div>

        <section className="border-b border-line">
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-[16px] font-semibold">Needs your attention</h2>
            <Link to="/app/inbox/assistant" className="text-[12px] text-accent">
              View all
            </Link>
          </div>
          {needs.map((item) => (
            <EmailRow key={item._id} item={item} selected={false} onToggle={() => {}} />
          ))}
        </section>

        <section className="px-5 py-4">
          <h2 className="mb-3 text-[16px] font-semibold">Upcoming meetings</h2>
          <div className="divide-y divide-line border border-line">
            {upcoming.map((c) => (
              <Link key={c._id} to={`/app/mail/${c._id}`} className="flex items-start justify-between gap-3 px-3 py-3 hover:bg-quiet">
                <div>
                  <p className="text-[13px] font-medium">{c.analysis.meeting.title || c.subject}</p>
                  <p className="text-[12px] text-muted">
                    {[c.analysis.meeting.date, c.analysis.meeting.time].filter(Boolean).join(" · ") || "Time in thread"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">From {c.subject}</p>
                </div>
                <ClassBadge value={c.classification} short />
              </Link>
            ))}
            {upcoming.length === 0 && <p className="px-3 py-6 text-[13px] text-muted">No meetings extracted.</p>}
          </div>
        </section>
      </div>

      <aside className="border-l border-line bg-surface">
        <div className="border-b border-line px-4 py-4">
          <h2 className="text-[16px] font-semibold">AI daily summary</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            {metrics?.assistant || 0} items need a reply from you. {metrics?.client || 0} need a client decision.
            {metrics?.review ? ` ${metrics.review} are flagged for review because confidence is low.` : ""} Keep the Helios agreement and Sequoia term sheet at the top of the stack.
          </p>
          {feed?.mode?.mock && <p className="mt-2 text-[11px] text-muted">Mock AI · deterministic summaries</p>}
        </div>
        <div className="border-b border-line px-4 py-4">
          <h3 className="text-[13px] font-semibold">Pending follow-ups</h3>
          <ul className="mt-2 space-y-2">
            {(follow || []).slice(0, 4).map((c) => (
              <li key={c._id}>
                <Link to={`/app/mail/${c._id}`} className="block text-[13px] hover:underline">
                  {c.subject}
                </Link>
                <p className="text-[11px] text-muted">Waiting since {formatTime(c.waitingSince || c.lastMessageAt)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-4">
          <h3 className="text-[13px] font-semibold">Recent activity</h3>
          <ul className="mt-2 space-y-3">
            {(feed?.activities || []).slice(0, 6).map((a) => (
              <li key={a._id} className="text-[12px] leading-5">
                <p>{a.text}</p>
                <p className="text-[11px] text-muted">{formatTime(a.at)}</p>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
