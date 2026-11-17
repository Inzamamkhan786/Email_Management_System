import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/layout/Logo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { api } from "../../lib/api";
import { useAuth } from "../../store/auth";

const steps = ["Welcome", "Workspace", "Connect", "Configure", "Sync"];

export default function Onboarding() {
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(user?.role || "assistant");
  const [provider, setProvider] = useState("gmail");
  const [form, setForm] = useState({
    workspaceName: "Northstar Desk",
    clientName: "Alex Rivera",
    assistantName: user?.name || "Sarah Chen",
    accountEmail: "alex@northwind.co",
  });
  const [progress, setProgress] = useState(12);
  const [busy, setBusy] = useState(false);

  const next = async () => {
    if (step < 4) {
      setStep(step + 1);
      if (step === 3) runSync();
      return;
    }
    setBusy(true);
    await api.post("/onboarding/complete", {
      workspaceName: form.workspaceName,
      clientName: form.clientName,
      assistantName: form.assistantName,
      provider,
      accountEmail: form.accountEmail,
    });
    await refresh();
    navigate(role === "client" ? "/c" : "/app/overview");
  };

  const runSync = () => {
    setProgress(12);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 16;
      });
    }, 280);
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg px-5 py-10">
      <Logo />
      <div className="mt-8 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-2 text-[12px] text-muted">
        Step {step + 1} of {steps.length}
      </p>

      {step === 0 && (
        <div className="mt-8">
          <h1 className="text-[24px] font-semibold">Welcome to MailPilot</h1>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            You will connect a mailbox, choose who this desk belongs to, and let MailPilot classify who should reply.
            Nothing is sent without a human reviewing it.
          </p>
        </div>
      )}
      {step === 1 && (
        <div className="mt-8">
          <h1 className="text-[24px] font-semibold">Choose workspace type</h1>
          <div className="mt-4 grid gap-2">
            {[
              { id: "assistant", title: "Personal Assistant", body: "Full inbox, classification, drafts, and client routing." },
              { id: "client", title: "Client", body: "A quiet list of conversations that need your personal input." },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`rounded-md border px-4 py-3 text-left ${role === r.id ? "border-accent" : "border-line"}`}
              >
                <p className="text-[14px] font-medium">{r.title}</p>
                <p className="text-[12px] text-muted">{r.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="mt-8">
          <h1 className="text-[24px] font-semibold">Connect an email account</h1>
          <p className="mt-2 text-[13px] text-muted">Demo connection only — MailPilot will not open a real OAuth window.</p>
          <div className="mt-4 grid gap-2">
            {[
              { id: "gmail", title: "Gmail" },
              { id: "outlook", title: "Outlook / Microsoft 365" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`rounded-md border px-4 py-3 text-left ${provider === p.id ? "border-accent" : "border-line"}`}
              >
                {p.title} · demo
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Input
              label="Mailbox address"
              value={form.accountEmail}
              onChange={(e) => setForm({ ...form, accountEmail: e.target.value })}
            />
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="mt-8 space-y-3">
          <h1 className="text-[24px] font-semibold">Configure workspace</h1>
          <Input label="Workspace name" value={form.workspaceName} onChange={(e) => setForm({ ...form, workspaceName: e.target.value })} />
          <Input label="Client name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <Input label="Assistant name" value={form.assistantName} onChange={(e) => setForm({ ...form, assistantName: e.target.value })} />
        </div>
      )}
      {step === 4 && (
        <div className="mt-8">
          <h1 className="text-[24px] font-semibold">Synchronization</h1>
          <p className="mt-2 text-[13px] text-muted">Simulated import of recent threads. Demo connection.</p>
          <div className="mt-6 border border-line p-4">
            <p className="text-[13px] font-medium">{provider === "gmail" ? "Gmail" : "Outlook"} · {form.accountEmail}</p>
            <p className="text-[12px] text-muted">Status: {progress >= 100 ? "Connected" : "Syncing"}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-quiet">
              <div className="h-full bg-accent transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="mt-2 text-[12px] tabular-nums text-muted">{Math.min(progress, 100)}%</p>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button onClick={next} loading={busy} disabled={step === 4 && progress < 100 && !busy}>
          {step === 4 ? "Enter workspace" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
