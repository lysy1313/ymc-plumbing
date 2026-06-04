type LoadingOverlayProps = {
  isVisible: boolean;
  title?: string;
  description?: string;
};

export function LoadingOverlay({
  isVisible,
  title = "Processing...",
  description = "Please wait while we complete the action.",
}: LoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[2px]">
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-lg">
        <span className="mb-3 size-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />

        <p className="text-sm font-semibold text-slate-950">{title}</p>

        <p className="mt-1 max-w-[260px] text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}