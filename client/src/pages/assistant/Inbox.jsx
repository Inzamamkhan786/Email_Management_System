import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import EmailList from "../../components/email/EmailList";

const titles = {
  all: "All emails",
  assistant: "Assistant to reply",
  client: "Client to reply",
  none: "No reply needed",
  review: "Needs review",
  important: "Important",
  action: "Action required",
  waiting: "Waiting for response",
  meetings: "Meetings & appointments",
  archived: "Archived",
};

export default function Inbox() {
  const { segment = "all" } = useParams();
  const { search } = useOutletContext() || {};
  const [params] = useSearchParams();
  const q = search || params.get("q") || "";

  return (
    <div>
      <div className="flex items-end justify-between border-b border-line px-5 py-4">
        <div>
          <h1 className="text-[22px] font-semibold">{titles[segment] || "Inbox"}</h1>
          <p className="text-[13px] text-muted">Switch segments without losing filters. Hover a row for quick actions.</p>
        </div>
      </div>
      <EmailList segment={segment} search={q} />
    </div>
  );
}
