# YMC Plumbing — Lead to Job CRM Flow

A small CRM-like web application for **YMC Plumbing**, a plumbing and pipe repair company.

The project demonstrates a practical business flow:

```txt
Lead → Create Job → Change Status → Run Automations → Track Event Log
```

The app helps a manager create jobs from incoming client leads, schedule plumbing work, move jobs through statuses, notify the team, and keep a simple job record in Google Sheets.

---

## What I Built

I built a CRM-like internal dashboard with:

- Lead creation and lead list
- Selected lead details
- Job creation from a selected lead
- Job status management
- Cancellation reason for Lost / Cancelled jobs
- Slack notifications
- Google Sheets create/update/delete sync
- Internal automation event log
- Duplicate lead handling by phone/email
- Form validation, loading states, skeletons, toasts, and error handling
- Small validation tests for lead and job schemas

---

## Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form**
- **Zod**
- **Prisma**
- **Neon PostgreSQL**
- **Slack Incoming Webhook**
- **Google Sheets via Apps Script**
- **Sonner**
- **Vitest**

---

## Lead-to-Job Flow

The main flow works like this:

1. A manager creates or selects a lead.
2. The manager opens the lead details.
3. The manager clicks **Create Job**.
4. The job form opens in a modal.
5. The manager fills in client, job, location, and schedule details.
6. The job is saved to the database.
7. The job appears in the jobs list for the selected lead.
8. The manager moves the job through statuses:
   - Job Created
   - Scheduled
   - In Progress
   - Completed
   - Lost / Cancelled

9. When the job status changes, backend automations are triggered.
10. The result of each automation is saved in the internal event log.

If a job is moved to **Lost / Cancelled**, the app requires a cancellation reason.

---

## Automations

The automation logic is implemented in the backend services.

When a job is created, updated, cancelled, or deleted, the backend can:

- Send a Slack notification
- Create or update a row in Google Sheets
- Delete a row from Google Sheets
- Save an event log entry inside the app

Automation-related code is located in:

```txt
src/server/services/automation.service.ts
src/server/services/slack.service.ts
src/server/services/googleSheets.service.ts
src/server/services/event-log.service.ts
```

If Slack or Google Sheets fails, the main job flow is not blocked. The app saves the integration result in the event log as `SUCCESS`, `ERROR`, or `SKIPPED`.

---

## Kommo CRM

Kommo CRM was not integrated directly.

Instead, I built a custom CRM-like interface that demonstrates the same workflow:

```txt
Leads list → Selected lead → Create job → Job statuses → Automations
```

This decision was made to keep the solution stable and focused within the test task time limit while still showing a realistic CRM workflow.

---

## n8n

n8n was not used.

Instead, automation logic is implemented directly in the backend services. This makes the flow easier to inspect, debug, and explain during the review.

---

## Environment Variables

Create a `.env` file based on `.env.example`.

```env
DATABASE_URL=""
DIRECT_URL=""

SLACK_WEBHOOK_URL=""

GOOGLE_SHEETS_WEBHOOK_URL=""
GOOGLE_SHEETS_WEBHOOK_SECRET=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Variables

`DATABASE_URL`
Used by the application to connect to Neon PostgreSQL.

`DIRECT_URL`
Used by Prisma migrations.

`SLACK_WEBHOOK_URL`
Slack Incoming Webhook URL for team notifications.

`GOOGLE_SHEETS_WEBHOOK_URL`
Google Apps Script Web App URL ending with `/exec`.

`GOOGLE_SHEETS_WEBHOOK_SECRET`
Secret value used to protect the Google Sheets webhook.

`NEXT_PUBLIC_APP_URL`
Public app URL. For local development, use `http://localhost:3000`.

---

## How to Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env`:

```bash
cp .env.example .env
```

Then fill in the required values.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the app

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Google Sheets Setup

Google Sheets integration works through Google Apps Script Web App.

The Apps Script endpoint supports these actions:

```txt
JOB_CREATED
STATUS_CHANGED
DELETE_JOB
CLEAR_SHEET
```

The Google Sheet stores:

```txt
Job ID
Client Name
Phone
Job Type
Address
Scheduled Time
Technician
Status
Action
Updated At
Cancellation Reason
```

After deploying the Apps Script as a Web App, add the deployment URL to:

```env
GOOGLE_SHEETS_WEBHOOK_URL=""
GOOGLE_SHEETS_WEBHOOK_SECRET=""
```

Required deployment settings:

```txt
Type: Web app
Execute as: Me
Who has access: Anyone
```

After changing the Apps Script code, create a new deployment version.

---

## Slack Setup

Slack notifications use an Incoming Webhook.

Add the webhook URL to:

```env
SLACK_WEBHOOK_URL=""
```

The app sends Slack messages when jobs are created or when their status changes.

---

## Available Scripts

```bash
npm run dev
```

Runs the app locally.

```bash
npm run build
```

Builds the production app.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run test
```

Runs validation tests.

```bash
npx prisma studio
```

Opens Prisma Studio.

---

## Tests

The project includes small validation tests for lead and job schemas.

Covered examples:

- Valid lead payload
- Missing required lead fields
- Invalid lead email
- Valid job payload
- Invalid job email
- Invalid job time range
- Missing required job fields

Run tests:

```bash
npm run test
```

---

## Deployment

Recommended deployment setup:

```txt
Vercel + Neon PostgreSQL
```

Required Vercel environment variables:

```env
DATABASE_URL
DIRECT_URL
SLACK_WEBHOOK_URL
GOOGLE_SHEETS_WEBHOOK_URL
GOOGLE_SHEETS_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

Recommended production build command:

```bash
prisma generate && prisma migrate deploy && next build
```

---

## AI Tools Usage

AI tools were used for development assistance, planning, debugging, code review, and README drafting.

All code was reviewed and adapted to fit the project requirements. I understand the submitted code and can explain the main parts of the implementation.

---

## Notes

Authentication, payments, and Google Maps were not implemented because they were not required for this task.

The main focus of the project is a working and understandable business process:

```txt
Create lead → Create job → Change status → Trigger Slack / Google Sheets → Track event log
```
