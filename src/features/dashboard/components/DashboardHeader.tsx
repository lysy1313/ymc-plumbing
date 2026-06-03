export function DashboardHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-950">
            YMC Plumbing
          </span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-sm text-slate-600">Lead to Job Flow</span>
        </div>

        <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 md:inline">
          CRM Dashboard
        </span>
      </div>
    </header>
  );
}
