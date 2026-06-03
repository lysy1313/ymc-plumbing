type SlackJobPayload = {
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

type SendSlackMessageParams = {
  title: string;
  job: SlackJobPayload;
};

export async function sendSlackJobMessage({
  title,
  job,
}: SendSlackMessageParams) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      ok: false,
      skipped: true,
      message: "Slack webhook URL is not configured",
    };
  }

  const scheduledTime = `${job.startDate} ${job.startTime} - ${job.endTime}`;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: `${title}: ${job.firstName} ${job.lastName} — ${job.jobType}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: title,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Client:*\n${job.firstName} ${job.lastName}`,
            },
            {
              type: "mrkdwn",
              text: `*Phone:*\n${job.phone}`,
            },
            {
              type: "mrkdwn",
              text: `*Job Type:*\n${job.jobType}`,
            },
            {
              type: "mrkdwn",
              text: `*Status:*\n${job.status}`,
            },
            {
              type: "mrkdwn",
              text: `*Address:*\n${job.address}, ${job.city}`,
            },
            {
              type: "mrkdwn",
              text: `*Scheduled:*\n${scheduledTime}`,
            },
            {
              type: "mrkdwn",
              text: `*Technician:*\n${job.technician}`,
            },
            {
              type: "mrkdwn",
              text: `*Job ID:*\n${job.id}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    return {
      ok: false,
      skipped: false,
      message: `Slack request failed: ${errorText}`,
    };
  }

  return {
    ok: true,
    skipped: false,
    message: "Slack notification sent",
  };
}
