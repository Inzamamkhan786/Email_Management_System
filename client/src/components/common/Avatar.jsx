import { initials } from "../../lib/format";

export default function Avatar({ name, size = 28 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-quiet text-[11px] font-medium text-ink"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
