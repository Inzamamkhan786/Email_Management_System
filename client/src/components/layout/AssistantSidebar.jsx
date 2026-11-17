import { NavLink } from "react-router-dom";
import {
  Archive,
  Calendar,
  CheckCircle2,
  CircleDot,
  Flag,
  Inbox,
  LayoutDashboard,
  Settings,
  Star,
  Timer,
  UserRound,
  Users,
  Plug,
  AlertCircle,
} from "lucide-react";
import Logo from "./Logo";
import { useUi } from "../../store/ui";

const groups = [
  {
    label: "Workspace",
    items: [
      { to: "/app/overview", label: "Overview", icon: LayoutDashboard, key: "total" },
      { to: "/app/inbox/all", label: "All Emails", icon: Inbox, key: "total" },
      { to: "/app/inbox/assistant", label: "Assistant to Reply", icon: CircleDot, key: "assistant" },
      { to: "/app/inbox/client", label: "Client to Reply", icon: UserRound, key: "client" },
      { to: "/app/inbox/none", label: "No Reply Needed", icon: CheckCircle2 },
      { to: "/app/inbox/review", label: "Needs Review", icon: AlertCircle, key: "review" },
    ],
  },
  {
    label: "Organization",
    items: [
      { to: "/app/inbox/important", label: "Important", icon: Star },
      { to: "/app/inbox/action", label: "Action Required", icon: Flag },
      { to: "/app/follow-ups", label: "Waiting for Response", icon: Timer, key: "waiting" },
      { to: "/app/meetings", label: "Meetings & Appointments", icon: Calendar },
      { to: "/app/inbox/archived", label: "Archived", icon: Archive },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/app/accounts", label: "Connected Accounts", icon: Plug },
      { to: "/app/clients", label: "Clients", icon: Users },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AssistantSidebar({ counts = {} }) {
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const mobileNav = useUi((s) => s.mobileNav);
  const setMobileNav = useUi((s) => s.setMobileNav);

  const nav = (
    <aside
      className={`${
        collapsed ? "w-[64px]" : "w-[240px]"
      } flex h-full flex-col border-r border-line bg-sidebar`}
    >
      <div className={`flex h-16 items-center border-b border-line ${collapsed ? "justify-center px-2" : "px-4"}`}>
        <Logo compact={collapsed} />
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-3">
            {!collapsed && (
              <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                {g.label}
              </p>
            )}
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNav(false)}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `mx-2 mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] ${
                    isActive ? "bg-quiet font-medium text-ink" : "text-muted hover:bg-quiet hover:text-ink"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <item.icon size={16} className="shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.key && counts[item.key] > 0 && (
                  <span className="text-[11px] tabular-nums text-muted">{counts[item.key]}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden h-full md:block">{nav}</div>
      {mobileNav && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileNav(false)} />
          <div className="relative h-full w-[240px]">{nav}</div>
        </div>
      )}
    </>
  );
}
