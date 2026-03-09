# Copilot Instructions — grads-system

## Project Overview

University graduation system with three user roles: **Student**, **Admin**, **Staff**. Built with **Next.js 16** (App Router), **React 19**, **TypeScript 5**, **Tailwind CSS 4**, **Prisma** ORM with **PostgreSQL** (Docker), and **Auth.js v5** for authentication. All UI screens come from **Figma** — see `.github/instructions/Implimenting Figma Designes.instructions.md` for the Figma-to-code workflow.

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | Next.js 16 | App Router only — no `pages/` directory |
| Database | PostgreSQL | Runs via `docker-compose.yml` at project root |
| ORM | Prisma | Schema in `prisma/schema.prisma`; run `bunx prisma migrate dev` / `bunx prisma generate` |
| Validation | Zod | Validate all API inputs. Co-locate schemas in `src/lib/validations/` |
| Auth | Auth.js v5 | Config in `src/lib/auth.ts`; route handler in `src/app/api/auth/[...nextauth]/route.ts` |
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
```

## Project Structure

```
prisma/
  schema.prisma              # Database schema (single source of truth for models)
docker-compose.yml           # PostgreSQL service
src/
  app/
    (student)/               # Student role routes
    (admin)/                  # Admin role routes
    (staff)/                  # Staff role routes
    (auth)/                   # Login/register routes
    api/                      # REST API route handlers
      auth/[...nextauth]/     # Auth.js handler
      students/               # /api/students
      ...
    globals.css               # Tailwind + design tokens
    layout.tsx                # Root layout
  components/
    ui/                       # Primitive components (Button, Input, Dialog, etc.)
    [feature]/                # Feature-specific composed components
  lib/
    auth.ts                   # Auth.js configuration
    prisma.ts                 # Prisma client singleton
    validations/              # Zod schemas (one file per domain: student.ts, project.ts, etc.)
    api/                      # API layer — data fetching functions (see below)
    mock/                     # Mock data for each domain
  types/                      # Shared TypeScript types
```

## Coding Conventions

- **No `any`** — never use the `any` type. Use `unknown` + type narrowing, generics, or explicit types.
- **TypeScript**: Strict mode. Prefer `type` over `interface`. Explicit types for function params and return values.
- **Components**: Use function declarations (`export default function ComponentName()`) — not arrow functions. Co-locate component-specific types in the same file.
- **Server vs Client**: Default to Server Components. Add `"use client"` only for browser APIs, event handlers, or hooks (`useState`, `useEffect`, etc.).
- **Images**: Always use `next/image` (`<Image>`) — never raw `<img>`.
- **Styling**: Tailwind utility classes directly. Design tokens in `globals.css` under `@theme inline`. Dark mode via `dark:` variants. **All UI must be fully responsive** (mobile-first with Tailwind breakpoints: `sm:`, `md:`, `lg:`).
- **Biome**: 2-space indent, recommended rules, organized imports. Run `bun run lint` to verify.

## API Layer Architecture (Critical Pattern)

All data flows through a typed API layer in `src/lib/api/`. This is the **only place** pages/components call for data — never fetch directly from components.

```
src/lib/api/
  students.ts    # getStudents(), getStudentById(), createStudent(), etc.
  projects.ts
  ...
```

Each API function:
1. Has a **typed return** (using types from `src/types/`)
2. Currently returns **mock data** from `src/lib/mock/`
3. When backend is ready, **only the function body changes** (swap mock → real fetch to `/api/...`)

Example pattern:

```ts
// src/lib/api/students.ts
import type { Student } from "@/types/student";
import { mockStudents } from "@/lib/mock/students";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getStudents(): Promise<Student[]> {
  // MOCK: swap this body when backend is ready
  // return fetch(`${API_BASE}/api/students`).then(res => res.json());
  return mockStudents;
}
```

Pages consume this via Server Components:

```tsx
// src/app/(admin)/students/page.tsx
import { getStudents } from "@/lib/api/students";
import { StudentList } from "@/components/students/student-list";

export default async function StudentsPage() {
  const students = await getStudents();
  return <StudentList students={students} />;
}
```

**Rules:**
- Components receive data via props — they never call the API layer directly
- Server Components call `src/lib/api/*` functions at the page level
- Client Components receive data as props from their parent Server Component
- When the backend is ready, swap mock implementations in `src/lib/api/` — no component changes needed

## Backend API Routes (Next.js Route Handlers)

REST-style at `src/app/api/[resource]/route.ts`:

```ts
// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validations/student";

export async function GET() {
  const students = await prisma.student.findMany();
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const student = await prisma.student.create({ data: parsed.data });
  return NextResponse.json(student, { status: 201 });
}
```

**Rules:**
- Validate every request body with Zod (`safeParse`, not `parse`)
- Return proper HTTP status codes
- Use `prisma` singleton from `@/lib/prisma`

## Prisma

- Single client instance in `src/lib/prisma.ts` (with global cache for dev hot-reload)
- All models defined in `prisma/schema.prisma`
- After schema changes: `bunx prisma migrate dev --name <description>` then `bunx prisma generate`

## Zod Validation

- Schemas live in `src/lib/validations/<domain>.ts`
- Infer TypeScript types from Zod schemas where practical: `type CreateStudent = z.infer<typeof createStudentSchema>`
- Use for both API route input validation and form validation on the client
