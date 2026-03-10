---
description: Follow these instructions when implementing UI screens from Figma designs
applyTo: 'src/components/**,src/app/**/page.tsx,src/app/**/layout.tsx'
---

# Implementing Figma Designs

These instructions define how to translate Figma screens into code for the grads-system project. The **backend is fully implemented** — all types, data access functions, API routes, auth, and validation schemas are production-ready. When implementing a Figma screen, you are wiring UI to an existing backend, not creating mock data.

## Workflow: When User Provides a Figma Link


## Component Strategy

- **Primitive/UI components** (`src/components/ui/`): Buttons, inputs, selects, badges, cards, modals, etc. These are project-specific — built from Figma designs, not from a library.
  - If the component **doesn't exist yet**, create it in `src/components/ui/` matching the Figma design exactly
  - If the component **already exists**, reuse it. If the Figma design shows a variant not yet supported (new size, color, state), **extend the existing component** with additional props — do NOT create a duplicate
  - Every UI component must accept a `className` prop for composition
- **Feature components** (`src/components/[feature]/`): Composed components specific to a feature (e.g., `StudentCard`, `DocumentsStatusCard`, `CertificateStatusCard`). These combine UI primitives with domain-specific layout.
- **Pages** (`src/app/[role]/[route]/page.tsx`): Assemble feature components and call the data access layer for data.

### Component Modularity Rules

```
✅ <Button variant="primary" size="lg">Submit</Button>    — reusable, prop-driven
❌ <SubmitButton>Submit</SubmitButton>                      — one-off, not reusable
✅ Extending: add `variant="outline"` to existing Button    — backward compatible
❌ Creating: new OutlineButton component                    — duplicates logic
```

## Responsive Design (Mandatory)

Every screen must work on **mobile (375px+)** and **desktop (1440px)**. Use Tailwind's mobile-first approach:

```tsx
// Mobile-first: base styles are mobile, then scale up
<div className="flex flex-col gap-4 px-4 md:flex-row md:gap-6 md:px-8 lg:px-12">
```

- Use `flex-col` → `md:flex-row` for stacked-to-side-by-side layouts
- Use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for card grids
- Hide/show elements with `hidden md:block` or `md:hidden`
- If Figma only shows desktop, **infer a sensible mobile layout** (stack columns, collapse sidebars, use hamburger menus)

## Data Flow (Critical)

Components NEVER fetch data themselves. Follow this strict pattern:

```
Figma Screen → page.tsx (Server Component) → calls src/lib/api/* (Prisma) → passes data as props → components render
```

### Existing Data Access Layer

The backend provides a complete data access layer in `src/lib/api/`. **Do NOT create mock data or new API functions** unless the screen requires data not already served by these functions:

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

All functions use **real Prisma queries** — no mocks, no HTTP fetch wrappers.

### Existing Types

Types are already defined in `src/types/`. **Reuse them** — do NOT redefine:

| File | Types |
|------|-------|
| `user.ts` | `UserRole`, `User` |
| `student.ts` | `Student`, `StudentWithProfile`, `CertificateStep`, `DocumentItem`, `StudentProfile`, `StudentHomeData` |
| `document.ts` | `Document`, `UploadDocumentInput` |
| `graduation-form.ts` | `GraduationForm`, `SubmitGraduationFormInput` |
| `notification.ts` | `Notification`, `CreateNotificationInput` |
| `certificate.ts` | `Certificate` |

### Existing Validation Schemas

Zod schemas are in `src/lib/validations/`. **Use them for form validation** on the client:

- `auth.ts` — `loginSchema`, `registerSchema`
- `student.ts` — `createStudentSchema`, `updateStudentSchema`, `updateStudentProfileSchema`
- `document.ts` — `uploadDocumentSchema`, `reviewDocumentSchema`
- `graduation-form.ts` — `submitGraduationFormSchema`, `reviewGraduationFormSchema`
- `notification.ts` — `createNotificationSchema`, `markReadSchema`
- `certificate.ts` — `uploadCertificateSchema`
- `certificate-step.ts` — `updateStepStatusSchema`

### Step-by-step when implementing a Figma screen:

1. **Check existing types** in `src/types/` — reuse what's there. Only add new types if the screen needs data not yet modeled.
2. **Check existing API functions** in `src/lib/api/` — find the function that provides the data this screen needs. Only add a new function if no existing one covers it.
3. **Build UI components** in `src/components/` — they receive data via props only.
4. **Wire up the page** in `src/app/[role]/[route]/page.tsx` — call the data access function, pass data to components.
5. **For forms/write operations** — use existing Server Actions (`src/lib/actions/`) or API route handlers (`src/app/api/`). Validate with existing Zod schemas from `src/lib/validations/`.

Example — implementing a student dashboard screen:

```tsx
// src/app/student/page.tsx — uses existing backend functions
import { redirect } from "next/navigation";
import { getStudentHomeData } from "@/lib/api/student-home";
import { auth } from "@/lib/auth";
import CertificateStatusCard from "@/components/student/certificate-status-card";
import DocumentsStatusCard from "@/components/student/documents-status-card";

export default async function StudentHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { profile, certificateSteps, documents } = await getStudentHomeData(session.user.id);

  return (
    <div className="flex flex-col gap-5 px-3 pb-6">
      {/* Profile header using profile.nameAr, profile.department */}
      <CertificateStatusCard steps={certificateSteps} />
      <DocumentsStatusCard documents={documents} />
    </div>
  );
}
```

### Authentication in Pages

Use `auth()` from `@/lib/auth` to get the current session. The session contains `user.id` and `user.role`:

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const session = await auth();
if (!session?.user?.id) redirect("/login");
// session.user.id — the logged-in user's ID
// session.user.role — "STUDENT" | "ADMIN" | "STAFF"
```

## Route Structure by Role

Map Figma screens to the correct route segment:

| Role | Route segment | Example path |
|------|---------------|-------------|
| Student | `student/` | `/student` (dashboard), `/student/notifications`, `/student/profile`, `/student/settings` |
| Admin | `admin/` | `/admin` (dashboard), `/admin/students` |
| Staff | `staff/` | `/staff` (dashboard) |
| Auth | `(auth)/` | `/login`, `/register`, `/pending` |

**Important:** These are **real route segments** (not route groups with parentheses), so they appear in the URL. `(auth)` is the only route group.

## Styling Rules

- **Match Figma exactly**: colors, spacing, font sizes, border radius, shadows. Extract exact values from the Figma design context.
- **Use design tokens** from `globals.css` under `@theme inline` when a value is reused (colors, fonts). Add new tokens there if Figma introduces new shared values.
- **Tailwind only** — no inline styles, no CSS modules, no styled-components.
- **Dark mode**: support via `dark:` variants. If Figma doesn't show dark mode, use sensible inversions.

## Quality Checklist (Before Finishing Any Screen)

- [ ] All components are in the correct directories (`ui/` for primitives, `[feature]/` for composed)
- [ ] No hardcoded data in components — all data comes from props
- [ ] Page fetches data from `src/lib/api/*` using real Prisma-backed functions (no mocks)
- [ ] Reused existing types from `src/types/` — no duplicate type definitions
- [ ] Reused existing API functions from `src/lib/api/` — no unnecessary new functions
- [ ] Forms use existing Zod schemas from `src/lib/validations/` for validation
- [ ] Write operations use Server Actions (`src/lib/actions/`) or API routes (`src/app/api/`)
- [ ] Responsive: tested mentally at 375px, 768px, and 1440px widths
- [ ] No `any` types anywhere
- [ ] All images use `next/image`
- [ ] Reused existing UI components where possible
- [ ] Auth check with `auth()` at the top of protected pages