# Copilot Instructions — grads-system

## Project Overview

University graduation system with three user roles: **Student**, **Admin**, **Staff**. Built with **Next.js 16** (App Router), **React 19**, **TypeScript 5**, **Tailwind CSS 4**, **Prisma** ORM with **PostgreSQL** (Docker), and **Auth.js v5** for authentication. The **backend is fully implemented** — all API routes, data layer, auth, and validation are production-ready. All UI screens come from **Figma** — see `.github/instructions/Implimenting Figma Designes.instructions.md` for the Figma-to-code workflow.

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | Next.js 16 | App Router only — no `pages/` directory |
| Database | PostgreSQL | Runs via `docker-compose.yml` at project root |
| ORM | Prisma | Schema in `prisma/schema.prisma`; run `bunx prisma migrate dev` / `bunx prisma generate` |
| Validation | Zod | Validate all API inputs. Co-locate schemas in `src/lib/validations/` |
| Auth | Auth.js v5 | Credentials provider (academicId + password); config in `src/lib/auth.ts`; route handler in `src/app/api/auth/[...nextauth]/route.ts` |
| Styling | Tailwind CSS 4 | Via `@tailwindcss/postcss`; tokens in `globals.css` under `@theme inline` |
| Linter/Formatter | Biome 2 | Replaces ESLint + Prettier — **do not add ESLint or Prettier configs** |
| React Compiler | Enabled | `reactCompiler: true` in `next.config.ts` — avoid manual `useMemo`/`useCallback` |
| Package manager | Bun or pnpm if not exist | Use `bun add` / `bun install`; lockfile is `bun.lock` |
| Path alias | `@/*` → `./src/*` | Always import with `@/` prefix |
| Fonts | Geist & Geist Mono | CSS vars `--font-geist-sans` / `--font-geist-mono` |

## Commands

```bash
bun dev                      # Start dev server (localhost:3000)
bun run build                # Production build
bun run lint                 # Biome check
bun run format               # Biome format (auto-fix)
docker compose up -d         # Start PostgreSQL
bunx prisma migrate dev      # Run DB migrations
bunx prisma generate         # Regenerate Prisma client
bunx prisma studio           # Visual DB browser
bunx prisma db seed          # Seed database with test data
```

## Project Structure

```
prisma/
  schema.prisma              # Database schema (single source of truth for models)
  seed.ts                    # Database seed script
  migrations/                # Prisma migration history
docker-compose.yml           # PostgreSQL service
src/
  proxy.ts                   # Auth & role-based routing helper (JWT check, role guards)
  app/
    layout.tsx               # Root layout (fonts, html/body)
    page.tsx                  # Root redirect (→ /login or role-based)
    globals.css               # Tailwind + design tokens
    (auth)/                   # Route group — auth pages share centered layout, no nav
      layout.tsx              # Centered auth layout
      login/page.tsx          # /login
      register/page.tsx       # /register
      pending/page.tsx        # /pending (awaiting admin approval)
    admin/                    # Real route segment → /admin/...
      layout.tsx              # Admin shell (sidebar, topbar)
      page.tsx                # /admin (admin dashboard)
      students/page.tsx       # /admin/students
    staff/                    # Real route segment → /staff/...
      layout.tsx              # Staff shell (sidebar, topbar)
      page.tsx                # /staff (staff dashboard)
    student/                  # Real route segment → /student/...
      layout.tsx              # Student shell (sidebar, topbar)
      page.tsx                # /student (student dashboard)
      notifications/page.tsx  # /student/notifications
      profile/page.tsx        # /student/profile
      settings/page.tsx       # /student/settings
    api/                      # REST API route handlers (all fully implemented)
      auth/[...nextauth]/     # Auth.js handler
      students/               # /api/students (CRUD + approve + documents + steps)
      graduation-form/        # /api/graduation-form (submit + review)
      documents/[id]/         # /api/documents (download, review, delete)
      certificates/[userId]/  # /api/certificates (upload, download, delete)
      notifications/          # /api/notifications (CRUD + read-all)
      student/home/           # /api/student/home (dashboard aggregate)
      uploads/[...path]/      # Serves uploaded files with MIME detection
  components/
    ui/                       # Primitive components (Button, Input, Dialog, etc.)
    auth/                     # Auth-related components (login-form, register-form)
    student/                  # Student feature components
    [feature]/                # Other feature-specific composed components
  lib/
    auth.ts                   # Auth.js configuration (Credentials provider, role in JWT/session)
    prisma.ts                 # Prisma client singleton (with global cache for dev hot-reload)
    validations/              # Zod schemas (one file per domain: student.ts, document.ts, etc.)
    api/                      # Data access layer — Prisma queries called by Server Components
    actions/                  # Server Actions (login, register, logout)
  types/                      # Shared TypeScript types (one file per domain)
```

### Route Architecture

- **`(auth)/`** is a **route group** (parentheses) — it shares a centered layout without adding a URL segment. `/login`, `/register`, and `/pending` live here.
- **`admin/`**, **`staff/`**, **`student/`** are **real route segments** — each creates a URL prefix (`/admin/...`, `/staff/...`, `/student/...`) so role-based pages never collide.
- Each role's `page.tsx` serves as that role's **dashboard** (e.g., `/admin` is the admin dashboard). No need for a nested `/admin/dashboard` route.
- Role-specific sub-pages go under their segment: `/admin/students`, `/staff/projects`, `/student/notifications`, etc.
- **`src/proxy.ts`** provides auth & role-based routing logic (JWT extraction, role guards, redirects). Not yet wired as Next.js middleware.

### Authentication Flow

- **Provider**: Credentials (academicId + password, hashed with bcryptjs)
- **Approval workflow**: New users register → `isApproved = false` → redirected to `/pending`. Admin approves → user can log in.
- **JWT callbacks** inject `role` and `id` into the session, accessible via `auth()` in Server Components.
- **Server Actions** for auth forms: `loginAction()`, `registerAction()`, `logoutAction()` in `src/lib/actions/`.

## Coding Conventions

- **No `any`** — never use the `any` type. Use `unknown` + type narrowing, generics, or explicit types.
- **TypeScript**: Strict mode. Prefer `type` over `interface`. Explicit types for function params and return values.
- **Components**: Use function declarations (`export default function ComponentName()`) — not arrow functions. Co-locate component-specific types in the same file.
- **Server vs Client**: Default to Server Components. Add `"use client"` only for browser APIs, event handlers, or hooks (`useState`, `useEffect`, etc.).
- **Images**: Always use `next/image` (`<Image>`) — never raw `<img>`.
- **Styling**: Tailwind utility classes directly. Design tokens in `globals.css` under `@theme inline`. Dark mode via `dark:` variants. **All UI must be fully responsive** (mobile-first with Tailwind breakpoints: `sm:`, `md:`, `lg:`).
- **Biome**: 2-space indent, recommended rules, organized imports. Run `bun run lint` to verify.

## Data Access Layer (Critical Pattern)

All data flows through a typed data access layer in `src/lib/api/`. These functions use **Prisma directly** (server-side only) and are the **only place** pages call for data — never query Prisma from components or pages directly.

```
src/lib/api/
  students.ts          # getStudents(), getStudentById(), createStudent(), updateStudent(), deleteStudent(), approveStudent(), getUnapprovedStudents()
  student-home.ts      # getStudentHomeData() — dashboard aggregate (profile, steps, documents)
  documents.ts         # getDocumentsByStudent(), createDocument(), updateDocumentStatus(), deleteDocument(), getDocumentFile()
  certificates.ts      # getCertificate(), uploadCertificate(), deleteCertificate(), getCertificateFile()
  certificate-steps.ts # getStepsByStudent(), updateStepStatus(), createDefaultSteps()
  graduation-forms.ts  # getGraduationForm(), submitGraduationForm(), reviewGraduationForm(), getAllForms()
  notifications.ts     # getNotifications(), getUnreadCount(), createNotification(), createGroupNotification(), markAsRead(), markAllAsRead()
```

Each API function:
1. Has a **typed return** (using types from `src/types/`)
2. Uses **Prisma queries directly** (no HTTP fetch, no mock data)
3. Is called from **Server Components only** at the page level

Example pattern:

```ts
// src/lib/api/students.ts
import { prisma } from "@/lib/prisma";
import type { Student } from "@/types/student";

export async function getStudents(): Promise<Student[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { createdAt: "desc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    academicId: u.academicId,
    department: u.studentProfile?.major ?? "",
    status: u.isApproved ? "active" as const : "suspended" as const,
  }));
}
```

Pages consume this via Server Components:

```tsx
// src/app/admin/students/page.tsx
import { getStudents } from "@/lib/api/students";
import StudentList from "@/components/students/student-list";

export default async function StudentsPage() {
  const students = await getStudents();
  return <StudentList students={students} />;
}
```

**Rules:**
- Components receive data via props — they never call the data access layer directly
- Server Components call `src/lib/api/*` functions at the page level
- Client Components receive data as props from their parent Server Component
- All data access functions use Prisma directly — no mock data, no HTTP fetch wrappers
- For write operations from the client, use **Server Actions** (`src/lib/actions/`) or **API route handlers** (`src/app/api/`)

## Backend API Routes (Next.js Route Handlers)

REST-style at `src/app/api/[resource]/route.ts`. All routes are **fully implemented** with real Prisma queries.

### Available Endpoints

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/students` | GET, POST | List all students; create new student (auto-generates certificate steps) |
| `/api/students/[id]` | GET, PUT, DELETE | Fetch, update, delete individual student |
| `/api/students/[id]/approve` | POST | Approve a pending student (`isApproved = true`) |
| `/api/students/[id]/documents` | GET, POST | List/upload documents for a student (file I/O) |
| `/api/students/[id]/steps` | GET, PUT | List/update certificate steps (staff/admin only) |
| `/api/graduation-form` | GET, POST | Get/submit graduation form (uses Prisma transactions) |
| `/api/graduation-form/[id]/review` | POST | Review form: approve or reject (sets reviewer metadata) |
| `/api/documents/[id]` | GET, PUT, DELETE | Download file; update status (ACCEPTED/REJECTED); delete |
| `/api/certificates/[userId]` | GET, POST, DELETE | Download/upload/delete certificate file (staff/admin only) |
| `/api/notifications` | GET, POST | List user notifications; create single/group notifications |
| `/api/notifications/[id]` | PUT | Mark notification as read |
| `/api/notifications/read-all` | POST | Mark all user notifications as read |
| `/api/student/home` | GET | Dashboard aggregate (profile, steps, documents) |
| `/api/uploads/[...path]` | GET | Serve uploaded files (MIME detection, path traversal protection) |

**Rules:**
- Validate every request body with Zod (`safeParse`, not `parse`)
- Return proper HTTP status codes
- Use `prisma` singleton from `@/lib/prisma`
- File uploads are stored in the `uploads/` directory at project root

## Prisma

- Single client instance in `src/lib/prisma.ts` (with global cache for dev hot-reload)
- All models defined in `prisma/schema.prisma`
- **Models**: User, Account, Session, VerificationToken (Auth.js), StudentProfile, GraduationForm, Document, CertificateStep, Notification, Certificate
- **Enums**: Role (STUDENT, ADMIN, STAFF), GraduationFormStatus, DocumentType, DocumentStatus, StepStatus
- After schema changes: `bunx prisma migrate dev --name <description>` then `bunx prisma generate`

## Zod Validation

- Schemas live in `src/lib/validations/<domain>.ts`
- **Existing schemas**: auth.ts, student.ts, document.ts, graduation-form.ts, notification.ts, certificate.ts, certificate-step.ts
- Infer TypeScript types from Zod schemas where practical: `type CreateStudent = z.infer<typeof createStudentSchema>`
- Use for both API route input validation and form validation on the client
