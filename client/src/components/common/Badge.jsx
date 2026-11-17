import { CLASS_META } from "../../lib/format";

export function ClassBadge({ value, short }) {
  const meta = CLASS_META[value] || CLASS_META.NEEDS_REVIEW;
  return (
    <span className={`inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium ${meta.className}`}>
      {short ? meta.short : meta.label}
    </span>
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium bg-quiet text-muted ${className}`}>
      {children}
    </span>
  );
}
