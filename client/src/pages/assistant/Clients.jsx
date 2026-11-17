import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Avatar from "../../components/common/Avatar";

export default function Clients() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", title: "" });
  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await api.get("/clients")).data.clients,
  });
  const create = useMutation({
    mutationFn: () => api.post("/clients", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
      setForm({ name: "", email: "", company: "", title: "" });
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold">Clients</h1>
          <p className="text-[13px] text-muted">People whose inboxes you manage from this workspace.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add client</Button>
      </div>
      <div className="divide-y divide-line border border-line">
        {(data || []).map((c) => (
          <div key={c._id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={c.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{c.name}</p>
              <p className="text-[12px] text-muted">
                {c.title} · {c.company} · {c.email}
              </p>
            </div>
            <div className="text-right text-[12px] text-muted">
              <p>{c.stats?.attention || 0} need their input</p>
              <p>{c.stats?.unread || 0} unread</p>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <Modal title="Add client" onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => create.mutate()} loading={create.isPending}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
