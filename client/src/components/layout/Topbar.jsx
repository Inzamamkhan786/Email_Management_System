import { Bell, ChevronDown, Command, Menu, Moon, Search, Sparkles, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useUi } from "../../store/ui";
import Avatar from "../common/Avatar";
import Tooltip from "../common/Tooltip";

export default function Topbar({ search, onSearch, workspaceName = "Northstar Desk" }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const theme = useUi((s) => s.theme);
  const cycleTheme = useUi((s) => s.cycleTheme);
  const setAiOpen = useUi((s) => s.setAiOpen);
  const setMobileNav = useUi((s) => s.setMobileNav);
  const toggleSidebar = useUi((s) => s.toggleSidebar);
  const [menu, setMenu] = useState(false);
  const [notes, setNotes] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-line bg-surface px-3 md:px-5">
      <button
        className="rounded-md p-2 text-muted hover:bg-quiet md:hidden"
        onClick={() => setMobileNav(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>
      <button
        className="hidden rounded-md p-2 text-muted hover:bg-quiet md:inline-flex"
        onClick={toggleSidebar}
        aria-label="Collapse sidebar"
      >
        <Menu size={18} />
      </button>

      <button className="hidden items-center gap-1 rounded-md border border-line px-2 py-1 text-[12px] text-ink md:flex">
        {workspaceName}
        <ChevronDown size={12} className="text-muted" />
      </button>

      <div className="relative min-w-0 flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search senders, subjects, clients"
          className="h-9 w-full rounded-md border border-line bg-bg pl-9 pr-12 text-[13px] placeholder:text-muted"
        />
        <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-line px-1.5 text-[10px] text-muted sm:flex">
          <Command size={10} /> /
        </span>
      </div>

      <Tooltip label="Ask MailPilot">
        <button
          onClick={() => setAiOpen(true)}
          className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink hover:bg-quiet sm:flex"
        >
          <Sparkles size={14} />
          Ask
        </button>
      </Tooltip>

      <Tooltip label={`Theme: ${theme}`}>
        <button onClick={cycleTheme} className="rounded-md p-2 text-muted hover:bg-quiet" aria-label="Toggle theme">
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </Tooltip>

      <div className="relative">
        <button onClick={() => setNotes((v) => !v)} className="relative rounded-md p-2 text-muted hover:bg-quiet" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
        {notes && (
          <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
            <div className="border-b border-line px-3 py-2 text-[12px] font-medium">Notifications</div>
            <p className="px-3 py-3 text-[12px] text-muted">Live notifications load from the workspace activity feed.</p>
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={() => setMenu((v) => !v)} className="flex items-center gap-2 rounded-md p-1 hover:bg-quiet">
          <Avatar name={user?.name} />
          <span className="hidden text-left text-[12px] leading-tight md:block">
            <span className="block font-medium">{user?.name}</span>
            <span className="text-muted">{user?.title}</span>
          </span>
        </button>
        {menu && (
          <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
            <button
              className="block w-full px-3 py-2 text-left text-[13px] hover:bg-quiet"
              onClick={() => {
                setMenu(false);
                navigate("/app/settings");
              }}
            >
              Settings
            </button>
            <button
              className="block w-full px-3 py-2 text-left text-[13px] text-danger hover:bg-quiet"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
