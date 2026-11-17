import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const empty = () => ({
  users: [],
  workspaces: [],
  clients: [],
  accounts: [],
  conversations: [],
  drafts: [],
  activities: [],
  notifications: [],
});

let state = empty();

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadStore() {
  ensureDir();
  if (fs.existsSync(DB_PATH)) {
    try {
      state = { ...empty(), ...JSON.parse(fs.readFileSync(DB_PATH, "utf8")) };
    } catch {
      state = empty();
    }
  }
  return state;
}

export function saveStore() {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

export function getState() {
  return state;
}

export function setState(next) {
  state = next;
  saveStore();
}

export function resetStore() {
  state = empty();
  saveStore();
  return state;
}

function match(doc, query = {}) {
  return Object.entries(query).every(([k, v]) => {
    if (v && typeof v === "object" && !Array.isArray(v) && "$in" in v) {
      return v.$in.includes(doc[k]);
    }
    if (v && typeof v === "object" && !Array.isArray(v) && "$ne" in v) {
      return doc[k] !== v.$ne;
    }
    return doc[k] === v;
  });
}

export function collection(name) {
  return {
    find(query = {}) {
      return (state[name] || []).filter((d) => match(d, query));
    },
    findOne(query = {}) {
      return (state[name] || []).find((d) => match(d, query)) || null;
    },
    findById(id) {
      return (state[name] || []).find((d) => d._id === id) || null;
    },
    insert(doc) {
      state[name].push(doc);
      saveStore();
      return doc;
    },
    updateById(id, patch) {
      const i = (state[name] || []).findIndex((d) => d._id === id);
      if (i < 0) return null;
      state[name][i] = { ...state[name][i], ...patch, updatedAt: new Date().toISOString() };
      saveStore();
      return state[name][i];
    },
    removeById(id) {
      const before = state[name].length;
      state[name] = state[name].filter((d) => d._id !== id);
      saveStore();
      return before !== state[name].length;
    },
  };
}

export const store = {
  users: () => collection("users"),
  workspaces: () => collection("workspaces"),
  clients: () => collection("clients"),
  accounts: () => collection("accounts"),
  conversations: () => collection("conversations"),
  drafts: () => collection("drafts"),
  activities: () => collection("activities"),
  notifications: () => collection("notifications"),
};
