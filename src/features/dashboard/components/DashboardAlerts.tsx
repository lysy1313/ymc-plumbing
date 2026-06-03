type DashboardAlertsProps = {
  actionMessage?: string | null;
  actionError?: string | null;
  jobsError?: string | null;
};

export function DashboardAlerts({
  actionMessage,
  actionError,
  jobsError,
}: DashboardAlertsProps) {
  return (
    <>
      {actionMessage ? (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {actionMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {jobsError ? (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {jobsError}
        </div>
      ) : null}
    </>
  );
}
