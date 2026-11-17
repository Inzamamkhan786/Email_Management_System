import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { useUi } from "../../store/ui";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Input from "../common/Input";

export default function Composer() {
  const composer = useUi((s) => s.composer);
  const setComposer = useUi((s) => s.setComposer);
  const [draft, setDraft] = useState(null);

  const create = useMutation({
    mutationFn: async ({ conversationId, tone }) => {
      const { data } = await api.post("/ai/draft-reply", { conversationId, tone });
      return data.draft;
    },
    onSuccess: setDraft,
  });

  const save = useMutation({
    mutationFn: async () => {
      const { data } = await api.put(`/drafts/${draft._id}`, draft);
      return data.draft;
    },
    onSuccess: () => toast.success("Draft saved"),
  });

  const send = useMutation({
    mutationFn: async () => {
      await api.put(`/drafts/${draft._id}`, draft);
      const { data } = await api.post(`/drafts/${draft._id}/send`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Sent (demo)");
      setComposer(null);
      setDraft(null);
    },
  });

  useEffect(() => {
    if (composer?.conversationId) {
      setDraft(null);
      create.mutate({ conversationId: composer.conversationId, tone: "professional" });
    }
  }, [composer?.conversationId]);

  if (!composer) return null;

  const restyle = (tone) => create.mutate({ conversationId: composer.conversationId, tone });

  return (
    <Modal
      wide
      title="Draft reply"
      onClose={() => {
        setComposer(null);
        setDraft(null);
      }}
    >
      <p className="mb-3 text-[12px] text-muted">
        Demo Mode — sending will not contact a real mailbox. Review the draft before you approve it.
      </p>
      {create.isPending && !draft && <p className="text-[13px] text-muted">Writing a draft…</p>}
      {draft && (
        <div className="space-y-3">
          <Input label="To" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
          <Input label="CC" value={draft.cc} onChange={(e) => setDraft({ ...draft, cc: e.target.value })} />
          <Input label="Subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium">Body</span>
            <textarea
              rows={10}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              className="w-full rounded-md border border-line bg-bg px-3 py-2 text-[13px] leading-6"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => restyle("professional")} loading={create.isPending}>
              Regenerate
            </Button>
            <Button variant="secondary" size="sm" onClick={() => restyle("short")}>
              Make shorter
            </Button>
            <Button variant="secondary" size="sm" onClick={() => restyle("professional")}>
              More professional
            </Button>
            <Button variant="secondary" size="sm" onClick={() => restyle("warm")}>
              Warmer tone
            </Button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setComposer(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => save.mutate()} loading={save.isPending}>
              Save draft
            </Button>
            <Button onClick={() => send.mutate()} loading={send.isPending}>
              Approve and send
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
