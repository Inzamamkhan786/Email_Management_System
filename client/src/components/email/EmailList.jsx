import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { api } from "../../lib/api";
import EmailRow from "./EmailRow";
import Empty from "../common/Empty";
import Button from "../common/Button";

export default function EmailList({ segment, search, hrefBase = "/app/mail" }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState("recent");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [priority, setPriority] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", segment, search, sort, unreadOnly, priority],
    queryFn: async () => {
      const { data } = await api.get("/conversations", {
        params: {
          segment,
          q: search || undefined,
          sort,
          unread: unreadOnly || undefined,
          priority: priority || undefined,
        },
      });
      return data.conversations;
    },
  });

  const items = data || [];
  const allIds = useMemo(() => items.map((i) => i._id), [items]);

  const bulk = useMutation({
    mutationFn: async ({ action, ids }) => {
      await api.post("/conversations/bulk", { action, ids });
    },
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["metrics"] });
    },
  });

  const patch = useMutation({
    mutationFn: async ({ id, body }) => api.patch(`/conversations/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["metrics"] });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <label className="flex items-center gap-2 text-[12px] text-muted">
          <input
            type="checkbox"
            checked={selected.length > 0 && selected.length === allIds.length}
            onChange={() => setSelected(selected.length === allIds.length ? [] : allIds)}
          />
          Select all
        </label>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="secondary" onClick={() => bulk.mutate({ action: "read", ids: selected })}>
              Mark read
            </Button>
            <Button size="sm" variant="secondary" onClick={() => bulk.mutate({ action: "unread", ids: selected })}>
              Unread
            </Button>
            <Button size="sm" variant="secondary" onClick={() => bulk.mutate({ action: "archive", ids: selected })}>
              Archive
            </Button>
            <Button size="sm" variant="secondary" onClick={() => bulk.mutate({ action: "important", ids: selected })}>
              Important
            </Button>
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-[12px]"
          >
            <option value="">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-[12px]"
          >
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>
          <label className="flex items-center gap-1.5 text-[12px] text-muted">
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
            Unread
          </label>
        </div>
      </div>
      {isLoading && (
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-quiet" />
          ))}
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <Empty icon={Inbox} title="Nothing in this view" body="Try another segment, or clear search and filters." />
      )}
      {!isLoading &&
        items.map((item) => (
          <EmailRow
            key={item._id}
            item={item}
            hrefBase={hrefBase}
            selected={selected.includes(item._id)}
            onToggle={(id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
            onArchive={(it) => patch.mutate({ id: it._id, body: { archived: true } })}
            onUnread={(it) => patch.mutate({ id: it._id, body: { unread: true } })}
          />
        ))}
    </div>
  );
}
