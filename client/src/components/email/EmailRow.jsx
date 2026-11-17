import { Paperclip, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import { ClassBadge } from "../common/Badge";
import { formatTime } from "../../lib/format";
import Tooltip from "../common/Tooltip";

export default function EmailRow({
  item,
  selected,
  onToggle,
  onArchive,
  onUnread,
  onImportant,
  hrefBase = "/app/mail",
}) {
  const navigate = useNavigate();
  const sender = item.participants?.[0] || item.messages?.[0]?.from || { name: "Unknown" };

  return (
    <div
      className={`email-row grid cursor-pointer grid-cols-[28px_28px_minmax(0,1fr)_auto] items-center gap-2 border-b border-line px-3 py-2.5 md:grid-cols-[28px_28px_160px_minmax(0,1fr)_92px] ${
        item.unread ? "bg-surface" : "bg-transparent"
      } hover:bg-quiet`}
      onClick={() => navigate(`${hrefBase}/${item._id}`)}
    >
      <input
        type="checkbox"
        checked={selected}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggle(item._id)}
        className="h-3.5 w-3.5 accent-[var(--accent)]"
      />
      <Avatar name={sender.name} size={28} />
      <div className="hidden min-w-0 md:block">
        <p className={`truncate text-[13px] ${item.unread ? "font-medium" : ""}`}>{sender.name}</p>
        <p className="truncate text-[11px] text-muted">{item.client?.name || item.client?.company}</p>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {item.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
          <p className={`truncate text-[14px] ${item.unread ? "font-medium" : ""}`}>{item.subject}</p>
          {item.important && <Star size={12} className="shrink-0 text-warn" />}
          {item.hasAttachments && <Paperclip size={12} className="shrink-0 text-muted" />}
        </div>
        <p className="truncate text-[12px] text-muted">{item.snippet}</p>
        <div className="mt-1 flex items-center gap-2 md:hidden">
          <ClassBadge value={item.classification} short />
          <span className="text-[11px] text-muted">{formatTime(item.lastMessageAt)}</span>
        </div>
      </div>
      <div className="hidden items-center justify-end gap-2 md:flex">
        <div className="email-row-actions flex items-center gap-1">
          <Tooltip label="Archive">
            <button
              className="rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-surface"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(item);
              }}
            >
              Archive
            </button>
          </Tooltip>
          <Tooltip label="Unread">
            <button
              className="rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-surface"
              onClick={(e) => {
                e.stopPropagation();
                onUnread?.(item);
              }}
            >
              Unread
            </button>
          </Tooltip>
        </div>
        <ClassBadge value={item.classification} short />
        <span className="w-14 text-right text-[11px] tabular-nums text-muted">{formatTime(item.lastMessageAt)}</span>
      </div>
    </div>
  );
}
