type GoogleSheetsJobPayload = {
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

type GoogleSheetsAction =
  | "JOB_CREATED"
  | "STATUS_CHANGED"
  | "DELETE_JOB"
  | "CLEAR_SHEET";

type IntegrationResult = {
  ok: boolean;
  skipped: boolean;
  message: string;
};

type SendJobToGoogleSheetsParams = {
  action: "JOB_CREATED" | "STATUS_CHANGED";
  job: GoogleSheetsJobPayload;
};

function getGoogleSheetsConfig() {
  return {
    webhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL,
    secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET,
  };
}

async function sendGoogleSheetsRequest(payload: {
  action: GoogleSheetsAction;
  job?: GoogleSheetsJobPayload;
  jobId?: string;
}): Promise<IntegrationResult> {
  const { webhookUrl, secret } = getGoogleSheetsConfig();

  if (!webhookUrl || !secret) {
    return {
      ok: false,
      skipped: true,
      message: "Google Sheets webhook is not configured",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        secret,
        ...payload,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        skipped: false,
        message: `Google Sheets request failed: ${responseText}`,
      };
    }

    const data = responseText ? JSON.parse(responseText) : null;

    if (data && data.ok === false) {
      return {
        ok: false,
        skipped: false,
        message: data.message ?? "Google Sheets returned an error",
      };
    }

    return {
      ok: true,
      skipped: false,
      message: data?.message ?? "Google Sheets request completed",
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown Google Sheets integration error",
    };
  }
}

export async function sendJobToGoogleSheets({
  action,
  job,
}: SendJobToGoogleSheetsParams): Promise<IntegrationResult> {
  return sendGoogleSheetsRequest({
    action,
    job,
  });
}

export async function deleteJobFromGoogleSheets(
  jobId: string,
): Promise<IntegrationResult> {
  return sendGoogleSheetsRequest({
    action: "DELETE_JOB",
    jobId,
  });
}

export async function clearGoogleSheetsJobs(): Promise<IntegrationResult> {
  return sendGoogleSheetsRequest({
    action: "CLEAR_SHEET",
  });
}
