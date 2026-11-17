export default function Empty({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted">
          <Icon size={18} />
        </div>
      )}
      <p className="text-[15px] font-medium">{title}</p>
      {body && <p className="mt-1 max-w-sm text-[13px] text-muted">{body}</p>}
    </div>
  );
}
