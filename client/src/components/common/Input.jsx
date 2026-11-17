export default function Input({ label, hint, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[12px] font-medium text-ink">{label}</span>}
      <input
        className={`h-10 w-full rounded-md border bg-surface px-3 text-[13px] text-ink placeholder:text-muted ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
    </label>
  );
}
