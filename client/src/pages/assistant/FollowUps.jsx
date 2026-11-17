import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { formatFull } from "../../lib/format";
import { ClassBadge } from "../../components/common/Badge";
import Empty from "../../components/common/Empty";
import { Timer } from "lucide-react";

function waitingFor(iso) {
  if (!iso) return "—";
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export default function FollowUps() {
  const { data } = useQuery({
    queryKey: ["conversations", "waiting"],
    queryFn: async () => (await api.get("/conversations", { params: { segment: "waiting" } })).data.conversations,
  });
  const items = data || [];
  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <h1 className="text-[22px] font-semibold">Waiting for response</h1>
      <p className="mt-1 text-[13px] text-muted">Threads where MailPilot is expecting someone else to come back.</p>
      {items.length === 0 && <Empty icon={Timer} title="No open follow-ups" body="When you send a demo reply, threads move here." />}
      <div className="mt-4 divide-y divide-line border border-line">
        {items.map((c) => (
          <Link key={c._id} to={`/app/mail/${c._id}`} className="block px-4 py-3 hover:bg-quiet">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-medium">{c.subject}</p>
              <ClassBadge value={c.classification} short />
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Last message {formatFull(c.lastMessageAt)} · Waiting {waitingFor(c.waitingSince)} · {c.client?.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
