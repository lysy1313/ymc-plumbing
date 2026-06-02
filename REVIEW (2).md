# REVIEW.md — ревью Day 1 MVP YMC Plumbing CRM Flow

Дата ревью: 2026-06-02  
Архив проекта: `YMC1.zip`

## 1. Краткий итог

Day 1 MVP почти собран: структура проекта, Prisma-модели, mock lead, форма Create Job, API routes, сохранение job в SQLite, смена статуса и event log внутри приложения уже есть.

Но перед переходом к Slack и Google Sheets нужно исправить несколько важных проблем:

1. В проекте отсутствует `tsconfig.json`. Из-за этого alias `@/...` может не работать стабильно, а TypeScript/Next-проект считается неполным.
2. В двух fetch-запросах ошибка в заголовке: `lication/json` вместо `application/json`.
3. В `package.json` нет удобных Prisma-скриптов и `postinstall` для генерации Prisma Client.
4. В `.gitignore` есть спорные моменты: `.env` игнорируется правильно, но нужно проверить, не попал ли он в git; также лучше явно добавить root SQLite-файлы и решить, коммитить ли `next-env.d.ts`.
5. В UI пока нет нормальной обработки ошибок загрузки jobs и смены статуса.
6. `EventLog` собирается из jobs, но не сортируется глобально по времени.
7. Типы `Lead`, `Job`, `EventLog` дублируются в нескольких компонентах.
8. Status flow сейчас позволяет прыгать между статусами свободно. Для демо это допустимо, но лучше сделать последовательный flow.

Общая оценка: **хорошая база для Day 1, но перед Day 2 надо исправить технические ошибки и немного усилить устойчивость приложения**.

---

## 2. Проверка по плану Day 1

| Пункт Day 1 | Статус | Комментарий |
|---|---:|---|
| Next.js проект | ✅ / ⚠️ | Проект создан, App Router используется. Но нет `tsconfig.json`, это критично для TypeScript и alias `@/*`. |
| Структура папок | ✅ | Структура хорошая: `features`, `shared`, `server`, `app/api`. |
| Prisma models | ✅ / ⚠️ | `Job` и `EventLog` есть. Можно добавить индексы и аккуратнее настроить Prisma scripts. |
| Mock lead | ✅ | Один mock lead есть. Для Day 1 достаточно. |
| Create Job форма | ✅ / ⚠️ | Форма есть и разделена на блоки. Нужно исправить `Content-Type` и улучшить error handling. |
| Сохранение job в SQLite | ✅ / ⚠️ | API/service есть. Но проверить запуск не удалось из-за проблем установки `better-sqlite3` в sandbox. |
| Смена статуса | ✅ / ⚠️ | PATCH route и кнопки есть. Нужно исправить `Content-Type`, добавить обработку ошибок и желательно последовательность статусов. |
| Event log внутри приложения | ✅ / ⚠️ | Event log есть. Нужно сортировать события глобально и лучше показывать тип события. |

---

## 3. Что удалось проверить технически

Я распаковал проект и просмотрел код вручную.

Попытка запустить `npm run lint` сразу не прошла, потому что в архиве нет `node_modules`:

```bash
npm run lint
# sh: 1: eslint: not found
```

После этого была попытка выполнить `npm ci`, но установка зависимостей остановилась на `better-sqlite3`: пакет пытался скачать prebuild с GitHub, а в sandbox был сбой доступа/таймаут.

```bash
npm ci
# better-sqlite3 install failed / timed out while trying prebuild-install or node-gyp rebuild
```

Поэтому полноценные команды `lint` и `build` я не смог выполнить. Ревью ниже основано на статическом просмотре кода.

---

# 4. Критичные исправления перед продолжением

## 4.1. Добавить `tsconfig.json`

### Проблема

В корне проекта отсутствует `tsconfig.json`. При этом почти весь код использует alias:

```ts
import { CrmDashboard } from "@/features/dashboard/components/CrmDashboard";
```

Без `tsconfig.json` TypeScript и редактор могут не понимать `@/...` импорты.

### Что добавить

Создай файл в корне проекта:

```txt
tsconfig.json
```

### Исправленная версия

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 4.2. Исправить `Content-Type` в `CreateJobForm.tsx`

### Проблема

Файл:

```txt
src/features/jobs/components/CreateJobForm.tsx
```

Сейчас:

```ts
headers: {
  "Content-Type": "lication/json",
},
```

Это опечатка. Должно быть `application/json`.

### Исправленная версия `onSubmit`

```ts
async function onSubmit(values: CreateJobFormValues) {
  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError("root", {
        message: data?.message ?? "Failed to create job. Please try again.",
      });
      return;
    }

    onSuccess();
  } catch {
    setError("root", {
      message: "Network error. Please check the server and try again.",
    });
  }
}
```

### Почему так лучше

- Исправлен MIME type.
- Есть `try/catch`.
- Пользователь увидит понятную ошибку, если сервер недоступен.
- Если API вернёт `message`, она будет показана.

---

## 4.3. Исправить `Content-Type` в `CrmDashboard.tsx`

### Проблема

Файл:

```txt
src/features/dashboard/components/CrmDashboard.tsx
```

Сейчас:

```ts
headers: {
  "Content-Type": "lication/json",
},
```

### Исправленная версия `handleStatusChange`

```ts
async function handleStatusChange(jobId: string, status: JobStatus) {
  setUpdatingJobId(jobId);

  try {
    const response = await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update job status");
    }

    await loadJobs();
  } catch {
    alert("Failed to update status. Please try again.");
  } finally {
    setUpdatingJobId(null);
  }
}
```

### Почему так лучше

Сейчас, если PATCH-запрос упадёт, пользователь этого не увидит. После исправления статус не будет молча ломаться.

---

## 4.4. Улучшить `loadJobs` в `CrmDashboard.tsx`

### Проблема

Сейчас:

```ts
async function loadJobs() {
  setIsLoadingJobs(true);

  const response = await fetch("/api/jobs");
  const data = await response.json();

  setJobs(data.jobs ?? []);
  setIsLoadingJobs(false);
}
```

Если `/api/jobs` упадёт, `setIsLoadingJobs(false)` не выполнится, и UI может навсегда остаться в состоянии `Loading jobs...`.

### Исправленная версия

Добавь state:

```ts
const [jobsError, setJobsError] = useState<string | null>(null);
```

Замени `loadJobs`:

```ts
async function loadJobs() {
  setIsLoadingJobs(true);
  setJobsError(null);

  try {
    const response = await fetch("/api/jobs");

    if (!response.ok) {
      throw new Error("Failed to load jobs");
    }

    const data = await response.json();
    setJobs(data.jobs ?? []);
  } catch {
    setJobsError("Failed to load jobs. Please refresh the page or check the server.");
  } finally {
    setIsLoadingJobs(false);
  }
}
```

И в JSX перед списком jobs добавь:

```tsx
{jobsError ? (
  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
    {jobsError}
  </div>
) : null}
```

---

## 4.5. Глобально отсортировать Event Log

### Проблема

Сейчас:

```ts
const allEvents = useMemo(() => {
  return jobs.flatMap((job) => job.events ?? []);
}, [jobs]);
```

События собираются из jobs, но глобально не сортируются. Если jobs несколько, события могут отображаться не в идеальном порядке.

### Исправленная версия

```ts
const allEvents = useMemo(() => {
  return jobs
    .flatMap((job) => job.events ?? [])
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}, [jobs]);
```

---

## 4.6. Добавить Prisma scripts и `postinstall`

### Проблема

В `package.json` сейчас нет Prisma-скриптов:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

После клонирования проекта проверяющий может выполнить `npm install`, но Prisma Client может не быть сгенерирован автоматически.

### Исправленная версия `scripts`

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "postinstall": "prisma generate"
}
```

### Почему так лучше

Проверяющему проще запустить проект:

```bash
npm install
npx prisma migrate dev
npm run dev
```

или:

```bash
npm run prisma:migrate -- --name init
npm run dev
```

---

## 4.7. Исправить `prisma.config.ts`

### Текущая версия

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Рекомендованная версия

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### Почему так лучше

`env("DATABASE_URL")` явно говорит Prisma Config, что переменная обязательна. Если её нет, ошибка будет понятнее.

---

# 5. Ревью `.gitignore`

## Что хорошо

`.env` уже игнорируется:

```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

`.env.example` разрешён к коммиту:

```gitignore
!.env.example
```

Это правильно, потому что позже в `.env` будут Slack webhook и Google Sheets URL.

## Что нужно проверить

В архиве есть файл `.env`. Это нормально для локальной разработки, но важно проверить, не добавлен ли он в Git.

Выполни:

```bash
git status --short
```

Если увидишь `.env` как tracked или staged, убери его из Git:

```bash
git rm --cached .env
```

## Рекомендованная версия `.gitignore`

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.*

# testing
/coverage

# next.js
/.next/
/out/

# production
/build
/dist

# misc
.DS_Store
Thumbs.db
*.pem

# debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# keep example env
!.env.example

# sqlite database files
*.db
*.db-journal
*.db-shm
*.db-wal
prisma/*.db
prisma/*.db-journal
prisma/*.db-shm
prisma/*.db-wal

# vercel
.vercel

# typescript
*.tsbuildinfo

# optional: keep next-env.d.ts committed unless you intentionally regenerate it
# next-env.d.ts
```

### Важная ремарка по `next-env.d.ts`

Сейчас в `.gitignore` есть:

```gitignore
next-env.d.ts
```

Я бы убрал эту строку из `.gitignore` и коммитил `next-env.d.ts`, потому что это стандартный файл Next.js/TypeScript проекта. Он автоматически создаётся, но обычно лежит в репозитории.

---

# 6. Ревью Prisma-моделей

## Что сделано хорошо

Файл:

```txt
prisma/schema.prisma
```

Есть две основные модели:

- `Job`
- `EventLog`

Это соответствует Day 1.

## Что можно улучшить сейчас

### 6.1. Добавить индексы

Сейчас в `EventLog` нет индекса по `jobId`. Для маленького тестового это не критично, но логично добавить.

### Исправленная версия Prisma schema

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Job {
  id String @id @default(cuid())

  leadId String

  firstName String
  lastName  String
  phone     String
  email     String?

  jobType     String
  jobSource   String
  description String?

  address String
  city    String
  zipCode String
  area    String?

  startDate  String
  startTime  String
  endTime    String
  technician String

  status String @default("JOB_CREATED")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events EventLog[]

  @@index([leadId])
  @@index([status])
  @@index([createdAt])
}

model EventLog {
  id String @id @default(cuid())

  jobId String?
  job   Job?    @relation(fields: [jobId], references: [id], onDelete: Cascade)

  type    String
  message String
  status  String @default("SUCCESS")

  createdAt DateTime @default(now())

  @@index([jobId])
  @@index([createdAt])
}
```

После изменения:

```bash
npx prisma migrate dev --name add_indexes
npx prisma generate
```

### 6.2. `EventLog.jobId` можно оставить optional

Сейчас:

```prisma
jobId String?
job   Job?
```

Для Day 1 это нормально. Позже это позволит писать глобальные события, например:

```txt
Slack integration failed
Google Sheets webhook not configured
```

Если хочешь, чтобы каждый log всегда был привязан к job, можно сделать `jobId String` и `job Job`, но я бы пока оставил optional.

---

# 7. Ревью server/service слоя

Файл:

```txt
src/server/services/jobs.service.ts
```

## Что хорошо

- Валидация входных данных через Zod есть.
- Создание job и event log идёт через transaction.
- Получение jobs включает `events`.
- Смена статуса создаёт event log.

## Что улучшить

### 7.1. Убрать лишний `satisfies JobStatus`

Сейчас:

```ts
status: data.status satisfies JobStatus,
```

Это не нужно, потому что `data.status` уже проверен через Zod. Лучше сделать проще.

### Исправленная версия фрагмента

```ts
data: {
  status: data.status,
},
```

Также можно убрать импорт `type JobStatus`, если он больше не нужен.

### 7.2. Сделать сообщения статусов более читабельными

Сейчас event log пишет техническое значение:

```txt
Status changed — IN_PROGRESS
```

Лучше показывать человекочитаемую метку:

```txt
Status changed — In Progress
```

### Исправленная версия `updateJobStatus`

```ts
import { prisma } from "@/server/db/prisma";
import { createJobSchema } from "@/features/jobs/schemas/job.schema";
import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
} from "@/features/jobs/types/job.types";
import { z } from "zod";

export const updateJobStatusSchema = z.object({
  status: z.enum([
    JOB_STATUSES.JOB_CREATED,
    JOB_STATUSES.SCHEDULED,
    JOB_STATUSES.IN_PROGRESS,
    JOB_STATUSES.COMPLETED,
    JOB_STATUSES.LOST_CANCELLED,
  ]),
  note: z.string().optional(),
});

export async function updateJobStatus(jobId: string, input: unknown) {
  const data = updateJobStatusSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const job = await tx.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: data.status,
      },
    });

    await tx.eventLog.create({
      data: {
        jobId: job.id,
        type: "STATUS_CHANGED",
        message: `Status changed — ${JOB_STATUS_LABELS[data.status]}${
          data.note ? ` — ${data.note}` : ""
        }`,
        status: "SUCCESS",
      },
    });

    return job;
  });
}
```

---

# 8. Ревью API routes

## 8.1. `src/app/api/jobs/route.ts`

### Что хорошо

- Есть `GET`.
- Есть `POST`.
- Ошибки Zod возвращаются как `400`.
- Общие ошибки возвращаются как `500`.

### Что можно улучшить

Сейчас `catch` в `GET` полностью скрывает ошибку. Для тестового можно добавить временный `console.error`, чтобы в видео показать backend logs, если что-то падает.

### Исправленная версия `GET`

```ts
export async function GET() {
  try {
    const jobs = await getJobs();

    return NextResponse.json({
      jobs,
    });
  } catch (error) {
    console.error("Failed to load jobs", error);

    return NextResponse.json(
      {
        message: "Failed to load jobs",
      },
      {
        status: 500,
      },
    );
  }
}
```

Для production так лучше логировать через нормальный logger, но для тестового это нормально.

## 8.2. `src/app/api/jobs/[id]/status/route.ts`

### Что хорошо

- PATCH route есть.
- Zod validation есть.
- Params под Next 16 написаны в формате `Promise`, это выглядит совместимо с новым App Router.

### Что можно улучшить

Если job не существует, сейчас пользователь получит просто `Failed to update status`. Для Day 1 допустимо. Позже можно обработать Prisma `P2025` как `404`.

---

# 9. Ревью Create Job формы

Файл:

```txt
src/features/jobs/components/CreateJobForm.tsx
```

## Что хорошо

- Есть `react-hook-form`.
- Есть `zodResolver`.
- Форма разделена на 4 блока:
  - Client details
  - Job details
  - Service location
  - Scheduled
- Есть loading state через `isSubmitting`.
- Submit button блокируется во время сохранения.
- Есть root error.

## Что улучшить

### 9.1. Исправить Content-Type

Указано выше.

### 9.2. Добавить default values для обязательных полей

Сейчас обязательные `jobType`, `startDate`, `startTime`, `endTime`, `technician` изначально пустые. Это хорошо для проверки validation. Но для удобного видео можно задать часть значений по умолчанию или оставить пустыми и показать validation.

Я бы оставил пустыми, чтобы в видео показать validation.

### 9.3. Убрать небезопасный cast для `jobSource`

Сейчас:

```ts
jobSource: lead.source as CreateJobFormValues["jobSource"],
```

Для одного mock lead это нормально, но лучше сделать типизированный mock lead, чтобы `source` уже был одним из `JOB_SOURCES`.

Исправление лучше делать через общий тип `Lead`, см. раздел 12.

---

# 10. Ревью status flow

Файл:

```txt
src/features/jobs/components/StatusActions.tsx
```

## Что хорошо

- Есть кнопки смены статуса.
- Кнопка текущего статуса disabled.
- `Lost / Cancelled` выделен danger-стилем.

## Что можно улучшить

Сейчас можно сразу перейти из `Job Created` в `Completed`. Для тестового это допустимо, но лучше показать реальный бизнес-flow:

```txt
Job Created → Scheduled → In Progress → Completed
                         ↘ Lost / Cancelled
```

### Улучшенная версия

```tsx
import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  type JobStatus,
} from "@/features/jobs/types/job.types";
import { Button } from "@/shared/components/Button";

type StatusActionsProps = {
  currentStatus: JobStatus;
  onChangeStatus: (status: JobStatus) => void;
  disabled?: boolean;
};

const allowedTransitions: Record<JobStatus, JobStatus[]> = {
  JOB_CREATED: [JOB_STATUSES.SCHEDULED, JOB_STATUSES.LOST_CANCELLED],
  SCHEDULED: [JOB_STATUSES.IN_PROGRESS, JOB_STATUSES.LOST_CANCELLED],
  IN_PROGRESS: [JOB_STATUSES.COMPLETED, JOB_STATUSES.LOST_CANCELLED],
  COMPLETED: [],
  LOST_CANCELLED: [],
};

export function StatusActions({
  currentStatus,
  onChangeStatus,
  disabled,
}: StatusActionsProps) {
  const availableStatuses = allowedTransitions[currentStatus];

  if (availableStatuses.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        This job is finished. No more status actions are available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableStatuses.map((status) => (
        <Button
          key={status}
          type="button"
          variant={
            status === JOB_STATUSES.LOST_CANCELLED ? "danger" : "secondary"
          }
          disabled={disabled}
          onClick={() => onChangeStatus(status)}
        >
          Move to {JOB_STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
```

Так flow будет выглядеть ближе к реальной CRM.

---

# 11. Ревью Event Log

Файл:

```txt
src/features/event-log/components/EventLog.tsx
```

## Что хорошо

- Event log есть.
- Показывает сообщение, статус и время.
- Это хорошо подходит для Day 1 и будущего Day 2, где появятся Slack/Google Sheets события.

## Что улучшить

### 11.1. Показывать тип события

Сейчас `event.type` не отображается. Лучше показать его маленьким label.

### Исправленная версия `EventLog` компонента

```tsx
import { Card } from "@/shared/components/Card";

type EventLogItem = {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
};

type EventLogProps = {
  events: EventLogItem[];
};

export function EventLog({ events }: EventLogProps) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-slate-950">
        Automation event log
      </h3>

      {events.length === 0 ? (
        <p className="text-sm text-slate-500">No events yet.</p>
      ) : (
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                  {event.type}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  {event.status}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-900">
                {event.message}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
```

---

# 12. Ревью типов и дублирования

## Проблема

Тип `Lead` повторяется в:

- `LeadCard.tsx`
- `CreateJobForm.tsx`

Типы `Job` и `EventLogItem` повторяются в:

- `CrmDashboard.tsx`
- `JobCard.tsx`
- `EventLog.tsx`

Для маленького Day 1 это не критично, но лучше вынести типы в отдельные файлы.

## Что добавить

### Новый файл

```txt
src/features/leads/types/lead.types.ts
```

```ts
import { JOB_SOURCES } from "@/features/jobs/types/job.types";

export type LeadSource = (typeof JOB_SOURCES)[number];

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  source: LeadSource;
  issue: string;
  address: string;
  city: string;
  zipCode: string;
  area: string;
};
```

### Обновить `mockLeads.ts`

```ts
import { type Lead } from "@/features/leads/types/lead.types";

export const mockLeads: Lead[] = [
  {
    id: "lead_001",
    firstName: "John",
    lastName: "Smith",
    phone: "+1 555 123 4567",
    email: "john.smith@example.com",
    source: "Phone Call",
    issue: "Client reported a leaking pipe under the kitchen sink.",
    address: "123 Main Street",
    city: "Austin",
    zipCode: "73301",
    area: "North Austin",
  },
];
```

### В `LeadCard.tsx`

Было:

```ts
type Lead = {
  id: string;
  firstName: string;
  // ...
};
```

Стало:

```ts
import { type Lead } from "@/features/leads/types/lead.types";
```

### В `CreateJobForm.tsx`

Было:

```ts
type Lead = {
  id: string;
  firstName: string;
  // ...
};
```

Стало:

```ts
import { type Lead } from "@/features/leads/types/lead.types";
```

После этого можно убрать cast:

```ts
jobSource: lead.source,
```

вместо:

```ts
jobSource: lead.source as CreateJobFormValues["jobSource"],
```

---

# 13. Ревью UI/styling

## Что хорошо

- Визуально проект уже похож на internal tool.
- Есть тёмный header.
- Карточки чистые, читаемые.
- Используются одинаковые shared components.
- Цвета спокойные и подходят под plumbing/internal CRM.

## Что улучшить на этом этапе

### 13.1. Названия shared components

Сейчас компоненты называются просто:

```txt
Button.tsx
Card.tsx
Input.tsx
Select.tsx
Textarea.tsx
```

Это нормально. Но в коде типы называются `AppButtonProps`, `AppInputProps`, хотя сами компоненты `Button`, `Input`. Лучше привести к одному стилю.

Вариант 1 — оставить короткие имена:

```ts
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};
```

Вариант 2 — переименовать компоненты в `AppButton`, `AppInput`, `AppCard`.  
Для тестового можно оставить как есть, но в идеале привести к одному стилю.

### 13.2. Форма не совсем modal/side panel

Сейчас форма открывается inline в правой колонке. Это допустимо, потому что задание разрешает modal, iframe-style window, side panel или отдельную страницу. Но визуально для CRM лучше оформить её как side panel или карточку с явным заголовком — у тебя уже почти так.

### 13.3. Убрать dark-mode override из `globals.css`

Сейчас:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Но весь dashboard рассчитан на светлый фон `bg-slate-100`. Если система пользователя в dark mode, body станет тёмным, а часть UI может выглядеть неожиданно.

Для тестового лучше сделать фиксированный светлый фон.

### Исправленная версия `globals.css`

```css
@import "tailwindcss";

:root {
  --background: #f1f5f9;
  --foreground: #0f172a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

---

# 14. Ревью `layout.tsx`

## Сейчас

```ts
export const metadata: Metadata = {
  title: "YMC Plumbing",
  description: "Generated by create next app",
};
```

## Улучшить

```ts
export const metadata: Metadata = {
  title: "YMC Plumbing CRM Flow",
  description: "Lead-to-job CRM workflow demo with statuses and automation logs.",
};
```

Так проект выглядит более адаптированным под задачу, а не как дефолтный create-next-app.

---

# 15. Ревью `.env.example`

## Сейчас

```env
DATABASE_URL="file:./dev.db"

SLACK_WEBHOOK_URL=""

GOOGLE_SHEETS_WEBHOOK_URL=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Это нормально.

## Что можно улучшить

Чтобы избежать путаницы с расположением SQLite-файла, лучше явно указать путь внутри `prisma`:

```env
DATABASE_URL="file:./prisma/dev.db"

SLACK_WEBHOOK_URL=""

GOOGLE_SHEETS_WEBHOOK_URL=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Если оставляешь `file:./dev.db`, убедись, что Prisma Migrate и runtime Prisma Client используют один и тот же файл базы.

---

# 16. Что точно готово для Day 1

Готово:

```txt
✅ CRM-like dashboard
✅ Mock lead
✅ Create Job button
✅ Create Job form
✅ 4 form blocks
✅ Zod validation
✅ React Hook Form
✅ API route for jobs
✅ API route for status update
✅ Prisma Job model
✅ Prisma EventLog model
✅ SQLite migration
✅ Event log creation on job creation
✅ Event log creation on status change
✅ Jobs list
✅ Status buttons
```

Не хватает / нужно исправить:

```txt
❌ tsconfig.json
❌ typo in Content-Type
❌ proper loadJobs error handling
❌ proper status update error handling
❌ globally sorted event log
❌ Prisma scripts in package.json
❌ postinstall prisma generate
⚠️ type duplication
⚠️ possible .env tracking risk
⚠️ no README yet
```

README не входил в Day 1, но скоро понадобится перед отправкой.

---

# 17. Минимальный список исправлений перед Day 2

Сделай именно в таком порядке:

## Шаг 1

Добавить `tsconfig.json`.

## Шаг 2

Исправить `Content-Type` в двух местах:

```txt
src/features/jobs/components/CreateJobForm.tsx
src/features/dashboard/components/CrmDashboard.tsx
```

Искать:

```ts
"lication/json"
```

Заменить на:

```ts
"application/json"
```

## Шаг 3

Добавить `try/catch/finally` в:

```txt
loadJobs
handleStatusChange
onSubmit
```

## Шаг 4

Добавить Prisma scripts в `package.json`.

## Шаг 5

Проверить, что `.env` не попал в Git:

```bash
git status --short
```

Если попал:

```bash
git rm --cached .env
```

## Шаг 6

Запустить локально:

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Шаг 7

Проверить руками:

```txt
1. Открыть http://localhost:3000
2. Нажать Create Job
3. Попробовать Save job с пустыми обязательными полями
4. Заполнить форму
5. Save job
6. Убедиться, что job появилась
7. Убедиться, что EventLog показывает Job created
8. Нажать Scheduled
9. Убедиться, что статус изменился
10. Убедиться, что EventLog показывает Status changed
11. Обновить страницу
12. Убедиться, что job сохранилась
```

---

# 18. Рекомендованный коммит после исправлений

```bash
git add .
git commit -m "fix day 1 crm flow stability issues"
```

Если хочешь разделить аккуратнее:

```bash
git add tsconfig.json package.json .gitignore prisma.config.ts
git commit -m "configure typescript prisma and project scripts"

git add src/features src/app/api src/server
git commit -m "fix job creation status updates and event log handling"
```

---

# 19. Вывод

Проект уже находится в правильном направлении. Для Day 1 база есть: lead-to-job flow собран, backend/API есть, Prisma-модели есть, SQLite persistence есть, status flow есть, event log есть.

Главное сейчас — не переходить к Slack/Google Sheets, пока не исправлены:

```txt
tsconfig.json
Content-Type typo
error handling
package scripts
.env tracking risk
```

После этих правок можно спокойно переходить к Day 2: Slack Incoming Webhook и Google Sheets automation.
