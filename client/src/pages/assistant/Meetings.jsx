import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "../../lib/api";
import Empty from "../../components/common/Empty";

export default function Meetings() {
  const { data } = useQuery({
    queryKey: ["conversations", "meetings"],
    queryFn: async () => (await api.get("/conversations", { params: { segment: "meetings" } })).data.conversations,
  });
  const items = (data || []).filter((c) => c.analysis?.meeting);
  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <h1 className="text-[22px] font-semibold">Meetings & appointments</h1>
      <p className="mt-1 text-[13px] text-muted">Extracted from connected inboxes. Calendar status is sample data in this prototype.</p>
      {items.length === 0 && <Empty icon={Calendar} title="No meetings found" />}
      <div className="mt-4 divide-y divide-line border border-line">
        {items.map((c) => (
          <Link key={c._id} to={`/app/mail/${c._id}`} className="block px-4 py-3 hover:bg-quiet">
            <p className="text-[14px] font-medium">{c.analysis.meeting.title || c.subject}</p>
            <p className="text-[12px] text-muted">
              {[c.analysis.meeting.date, c.analysis.meeting.time].filter(Boolean).join(" · ")}
              {c.analysis.meeting.participants ? ` · ${c.analysis.meeting.participants.join(", ")}` : ""}
            </p>
            <p className="mt-1 text-[11px] text-muted">Source: {c.subject} · Hold not yet on calendar</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
