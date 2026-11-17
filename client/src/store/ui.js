import { create } from "zustand";

function applyTheme(mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export const useUi = create((set, get) => ({
  theme: localStorage.getItem("mailpilot-theme") || "system",
  sidebarCollapsed: false,
  mobileNav: false,
  aiOpen: false,
  composer: null,
  whyOpen: null,
  setTheme(theme) {
    localStorage.setItem("mailpilot-theme", theme);
    applyTheme(theme);
    set({ theme });
  },
  cycleTheme() {
    const order = ["light", "dark", "system"];
    const next = order[(order.indexOf(get().theme) + 1) % order.length];
    get().setTheme(next);
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileNav: (mobileNav) => set({ mobileNav }),
  setAiOpen: (aiOpen) => set({ aiOpen }),
  setComposer: (composer) => set({ composer }),
  setWhyOpen: (whyOpen) => set({ whyOpen }),
  initTheme() {
    applyTheme(get().theme);
  },
}));
