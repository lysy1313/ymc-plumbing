import { sendJobToGoogleSheets } from "@/server/services/googleSheets.service";
import { createEventLog } from "@/server/services/event-log.service";
import { sendSlackJobMessage } from "@/server/services/slack.service";

type AutomationJob = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobType: string;
  address: string;
  city: string;
  startDate: string;
  startTime: string;
  endTime: string;
  technician: string;
  status: string;
};

type AutomationAction = "JOB_CREATED" | "STATUS_CHANGED";

type RunJobAutomationsParams = {
  action: AutomationAction;
  job: AutomationJob;
};

function getSlackTitle(action: AutomationAction, job: AutomationJob) {
  if (action === "JOB_CREATED") {
    return "New job created";
  }

  return `Job status changed to ${job.status}`;
}

function getEventStatus(result: { ok: boolean; skipped: boolean }) {
  if (result.ok) {
    return "SUCCESS" as const;
  }

  if (result.skipped) {
    return "SKIPPED" as const;
  }

  return "ERROR" as const;
}

function normalizeIntegrationMessage(message: string) {
  const withoutHtml = message
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (withoutHtml.length > 240) {
    return `${withoutHtml.slice(0, 240)}...`;
  }

  return withoutHtml;
}

export async function runJobAutomations({
  action,
  job,
}: RunJobAutomationsParams) {
  const slackResult = await sendSlackJobMessage({
    title: getSlackTitle(action, job),
    job,
  }).catch((error) => ({
    ok: false,
    skipped: false,
    message:
      error instanceof Error
        ? error.message
        : "Unknown Slack integration error",
  }));

  await createEventLog({
    jobId: job.id,
    type: slackResult.ok ? "SLACK_SENT" : "SLACK_FAILED",
    message: normalizeIntegrationMessage(slackResult.message),
    status: getEventStatus(slackResult),
  });

  const sheetsResult = await sendJobToGoogleSheets({
    action,
    job,
  }).catch((error) => ({
    ok: false,
    skipped: false,
    message:
      error instanceof Error
        ? error.message
        : "Unknown Google Sheets integration error",
  }));

  await createEventLog({
    jobId: job.id,
    type: sheetsResult.ok ? "GOOGLE_SHEETS_UPDATED" : "GOOGLE_SHEETS_FAILED",
    message: normalizeIntegrationMessage(sheetsResult.message),
    status: getEventStatus(sheetsResult),
  });

  return {
    slack: slackResult,
    googleSheets: sheetsResult,
  };
}
