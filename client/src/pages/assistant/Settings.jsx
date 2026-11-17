import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useUi } from "../../store/ui";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Settings() {
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const theme = useUi((s) => s.theme);
  const setTheme = useUi((s) => s.setTheme);
  const [name, setName] = useState(user?.name || "");
  const { data } = useQuery({
    queryKey: ["ai-settings"],
    queryFn: async () => (await api.get("/settings/ai")).data,
  });
  const { data: ws } = useQuery({
    queryKey: ["workspace"],
    queryFn: async () => (await api.get("/workspace")).data.workspace,
  });
  const [wsName, setWsName] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-5 py-6">
      <div>
        <h1 className="text-[22px] font-semibold">Settings</h1>
        <p className="text-[13px] text-muted">Profile, workspace, theme, and classification thresholds.</p>
      </div>
      <section className="border border-line p-4">
        <h2 className="text-[16px] font-semibold">Profile</h2>
        <div className="mt-3 space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email || ""} disabled />
          <Button
            onClick={async () => {
              await api.patch("/auth/me", { name });
              await refresh();
              toast.success("Profile saved");
            }}
          >
            Save profile
          </Button>
        </div>
      </section>
      <section className="border border-line p-4">
        <h2 className="text-[16px] font-semibold">Workspace</h2>
        <div className="mt-3 space-y-3">
          <Input label="Workspace name" value={wsName || ws?.name || ""} onChange={(e) => setWsName(e.target.value)} />
          <p className="text-[12px] text-muted">
            Assistant: {ws?.assistantName} · Primary client: {ws?.clientName}
          </p>
          <Button
            variant="secondary"
            onClick={async () => {
              await api.patch("/workspace", { name: wsName || ws?.name });
              toast.success("Workspace updated");
            }}
          >
            Save workspace
          </Button>
        </div>
      </section>
      <section className="border border-line p-4">
        <h2 className="text-[16px] font-semibold">Theme</h2>
        <div className="mt-3 flex gap-2">
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`h-9 rounded-md border px-3 text-[13px] capitalize ${
                theme === t ? "border-accent text-ink" : "border-line text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>
      <section className="border border-line p-4">
        <h2 className="text-[16px] font-semibold">AI classification</h2>
        <p className="mt-2 text-[13px] text-muted">
          Auto-classify at {Math.round((data?.thresholds?.auto || 0.9) * 100)}% confidence. Send to Needs Review below{" "}
          {Math.round((data?.thresholds?.review || 0.7) * 100)}%. Configure via server environment variables.
        </p>
        <p className="mt-2 text-[12px] text-muted">
          Engine: {data?.mode?.mock ? "Mock AI (deterministic)" : data?.mode?.provider}
        </p>
      </section>
      <section className="border border-line p-4">
        <h2 className="text-[16px] font-semibold">Notifications</h2>
        <label className="mt-3 flex items-center gap-2 text-[13px]">
          <input type="checkbox" defaultChecked /> Client actions
        </label>
        <label className="mt-2 flex items-center gap-2 text-[13px]">
          <input type="checkbox" defaultChecked /> Low-confidence classifications
        </label>
        <label className="mt-2 flex items-center gap-2 text-[13px]">
          <input type="checkbox" defaultChecked /> Meeting extraction
        </label>
      </section>
    </div>
  );
}
