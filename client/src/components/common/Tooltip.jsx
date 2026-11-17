export default function Tooltip({ label, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-surface opacity-0 shadow-pop transition-opacity group-hover:opacity-100 dark:text-[#101114]">
        {label}
      </span>
    </span>
  );
}
