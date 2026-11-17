export default function Logo({ compact }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[12px] font-semibold text-white dark:text-[#101114]">
        M
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-tight">MailPilot</span>}
    </div>
  );
}
