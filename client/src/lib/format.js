export function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatFull(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const CLASS_META = {
  ASSISTANT_TO_REPLY: {
    label: "Assistant to Reply",
    short: "Assistant",
    className: "bg-[#EEF0FE] text-[#3D37C9] dark:bg-[#2A2F55] dark:text-[#C7CBFF]",
  },
  CLIENT_TO_REPLY: {
    label: "Client to Reply",
    short: "Client",
    className: "bg-[#F8EFE0] text-[#9A6410] dark:bg-[#3A311C] dark:text-[#F0D39A]",
  },
  NO_REPLY_NEEDED: {
    label: "No Reply Needed",
    short: "No reply",
    className: "bg-[#F1F3F6] text-[#5C6370] dark:bg-[#2A2E36] dark:text-[#AEB5C0]",
  },
  NEEDS_REVIEW: {
    label: "Needs Review",
    short: "Review",
    className: "bg-[#F1ECFB] text-[#6D4CC4] dark:bg-[#32294A] dark:text-[#D2C2F6]",
  },
};

export const PRIORITY_META = {
  HIGH: { label: "High", className: "text-danger" },
  MEDIUM: { label: "Medium", className: "text-warn" },
  LOW: { label: "Low", className: "text-muted" },
};

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
