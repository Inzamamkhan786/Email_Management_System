import clsx from "clsx";

const styles = {
  primary:
    "bg-accent text-white hover:opacity-90 disabled:opacity-50 dark:text-[#101114]",
  secondary:
    "bg-surface text-ink border border-line hover:bg-quiet",
  ghost: "text-ink hover:bg-quiet",
  danger: "bg-danger text-white hover:opacity-90",
  subtle: "bg-quiet text-ink hover:bg-line",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed",
        size === "sm" && "h-8 px-2.5 text-12 rounded-md text-[12px]",
        size === "md" && "h-9 px-3 text-[13px] rounded-md",
        size === "lg" && "h-11 px-4 text-[14px] rounded-lg",
        styles[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
