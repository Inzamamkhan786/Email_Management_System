import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { formatFull } from "../../lib/format";

export default function Accounts() {
  const qc = useQueryClient();
  const [connect, setConnect] = useState(null);
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(null);
  const { data } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await api.get("/accounts")).data.accounts,
  });
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await api.get("/clients")).data.clients,
  });

  const add = useMutation({
    mutationFn: () => api.post("/accounts/connect", { provider: connect, email }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setConnect(null);
      setEmail("");
    },
  });
  const sync = useMutation({
    mutationFn: (id) => api.post(`/accounts/${id}/sync`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      toast.success("Disconnected");
      setConfirm(null);
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <h1 className="text-[22px] font-semibold">Connected accounts</h1>
      <p className="mt-1 text-[13px] text-muted">
        Prototype connections are simulated. MailPilot does not request a live OAuth grant unless you configure a real provider.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => setConnect("gmail")}>
          Connect Gmail (demo)
        </Button>
        <Button variant="secondary" onClick={() => setConnect("outlook")}>
          Connect Outlook (demo)
        </Button>
      </div>
      <div className="mt-5 divide-y divide-line border border-line">
        {(data || []).map((a) => (
          <div key={a._id} className="flex flex-wrap items-start gap-3 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-[11px] font-semibold uppercase">
              {a.provider === "gmail" ? "G" : "M"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{a.email}</p>
              <p className="text-[12px] text-muted">
                {a.provider === "gmail" ? "Gmail" : "Outlook / Microsoft 365"} · {a.client?.name || "Unassigned"}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Status: {a.status} · Last sync {formatFull(a.lastSyncAt) || "—"} · Every {a.syncFrequency}
              </p>
              {a.demo && <p className="mt-1 text-[11px] text-muted">Demo connection</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => sync.mutate(a._id)} loading={sync.isPending}>
                Sync
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirm(a)}>
                Disconnect
              </Button>
            </div>
          </div>
        ))}
      </div>
      {connect && (
        <Modal title={`Connect ${connect === "gmail" ? "Gmail" : "Outlook"} (demo)`} onClose={() => setConnect(null)}>
          <p className="mb-3 text-[13px] text-muted">This simulates OAuth. No Google or Microsoft account will be contacted.</p>
          <Input label="Mailbox email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConnect(null)}>
              Cancel
            </Button>
            <Button onClick={() => add.mutate()} loading={add.isPending}>
              Simulate connect
            </Button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal title="Disconnect this mailbox?" onClose={() => setConfirm(null)}>
          <p className="text-[13px] text-muted">
            {confirm.email} will be removed from this workspace. Existing conversations stay in MailPilot.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => remove.mutate(confirm._id)} loading={remove.isPending}>
              Disconnect
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
