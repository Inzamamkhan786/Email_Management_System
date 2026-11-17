import { create } from "zustand";
import { api } from "../lib/api";

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  async bootstrap() {
    const token = localStorage.getItem("mailpilot-token");
    if (!token) {
      set({ loading: false, user: null });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem("mailpilot-token");
      set({ user: null, loading: false });
    }
  },
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("mailpilot-token", data.token);
    set({ user: data.user });
    return data.user;
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("mailpilot-token", data.token);
    set({ user: data.user });
    return data.user;
  },
  logout() {
    localStorage.removeItem("mailpilot-token");
    set({ user: null });
  },
  async refresh() {
    const { data } = await api.get("/auth/me");
    set({ user: data.user });
    return data.user;
  },
}));
