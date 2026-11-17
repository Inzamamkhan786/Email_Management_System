import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AssistantSidebar from "../../components/layout/AssistantSidebar";
import Topbar from "../../components/layout/Topbar";
import AiPanel from "../../components/ai/AiPanel";
import Composer from "../../components/email/Composer";
import { api } from "../../lib/api";
import { useUi } from "../../store/ui";

export default function AssistantShell() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => (await api.get("/metrics")).data,
  });
  const { data: ws } = useQuery({
    queryKey: ["workspace"],
    queryFn: async () => (await api.get("/workspace")).data,
  });

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (e.key === "Escape") {
        useUi.getState().setAiOpen(false);
        useUi.getState().setComposer(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.length > 1) navigate(`/app/inbox/all?q=${encodeURIComponent(search)}`);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <AssistantSidebar counts={metrics || {}} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar search={search} onSearch={setSearch} workspaceName={ws?.workspace?.name} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet context={{ search, metrics }} />
        </main>
      </div>
      <AiPanel />
      <Composer />
    </div>
  );
}
