---
description: Follow these instructions when implementing UI screens from Figma designs
applyTo: 'src/components/**,src/app/**/page.tsx,src/app/**/layout.tsx'
---

# Implementing Figma Designs

These instructions define how to translate Figma screens into code for the grads-system project.

## Workflow: When User Provides a Figma Link

1. **Extract the node ID** from the URL (`node-id=X-Y` → `X:Y`)
2. **Call `get_design_context`** with `nodeId`, `clientFrameworks: "react,next"`, `clientLanguages: "typescript,css"`, and the appropriate `artifactType` (usually `WEB_PAGE_OR_APP_SCREEN`)
3. **Call `get_screenshot`** with the same `nodeId` to see the visual reference
4. **If the design is complex**, call `get_metadata` first to understand the node tree, then call `get_design_context` on individual child nodes

## Component Strategy

- **Primitive/UI components** (`src/components/ui/`): Buttons, inputs, selects, badges, cards, modals, etc. These are project-specific — built from Figma designs, not from a library.
  - If the component **doesn't exist yet**, create it in `src/components/ui/` matching the Figma design exactly
  - If the component **already exists**, reuse it. If the Figma design shows a variant not yet supported (new size, color, state), **extend the existing component** with additional props — do NOT create a duplicate
  - Every UI component must accept a `className` prop for composition
- **Feature components** (`src/components/[feature]/`): Composed components specific to a feature (e.g., `StudentCard`, `ProjectTable`, `GradeChart`). These combine UI primitives with domain-specific layout.
- **Pages** (`src/app/(...)/[route]/page.tsx`): Assemble feature components and call the API layer for data.

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
Figma Screen → page.tsx (Server Component) → calls src/lib/api/* → passes data as props → components render
```

### Step-by-step when implementing a Figma screen:

1. **Define types** in `src/types/[domain].ts` matching the data the screen needs
2. **Create mock data** in `src/lib/mock/[domain].ts` that matches those types
3. **Create API functions** in `src/lib/api/[domain].ts` that return mock data (typed)
4. **Build UI components** in `src/components/` — they receive data via props only
5. **Wire up the page** in `src/app/(...)/[route]/page.tsx` — call API functions, pass to components

Example for a "Students List" screen:

```ts
// 1. src/types/student.ts
export type Student = {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "active" | "graduated" | "suspended";
};

// 2. src/lib/mock/students.ts
import type { Student } from "@/types/student";
export const mockStudents: Student[] = [
  { id: "1", name: "Ahmed Ali", email: "ahmed@uni.edu", department: "CS", status: "active" },
  // ...more mock entries
];

// 3. src/lib/api/students.ts
import type { Student } from "@/types/student";
import { mockStudents } from "@/lib/mock/students";
export async function getStudents(): Promise<Student[]> {
  // MOCK — swap body when backend is ready:
  // return fetch(`${API_BASE}/api/students`).then(r => r.json());
  return mockStudents;
}

// 4. src/components/students/student-list.tsx
import type { Student } from "@/types/student";
type StudentListProps = { students: Student[] };
export default function StudentList({ students }: StudentListProps) {
  return ( /* Tailwind UI matching Figma */ );
}

// 5. src/app/(admin)/students/page.tsx
import { getStudents } from "@/lib/api/students";
import StudentList from "@/components/students/student-list";
export default async function StudentsPage() {
  const students = await getStudents();
  return <StudentList students={students} />;
}
```

## Route Structure by Role

Map Figma screens to the correct route group:

| Role | Route group | Example path |
|------|-------------|-------------|
| Student | `(student)` | `/dashboard`, `/my-project`, `/grades` |
| Admin | `(admin)` | `/students`, `/departments`, `/settings` |
| Staff | `(staff)` | `/assigned-students`, `/review` |
| Auth | `(auth)` | `/login`, `/register` |

## Styling Rules

- **Match Figma exactly**: colors, spacing, font sizes, border radius, shadows. Extract exact values from the Figma design context.
- **Use design tokens** from `globals.css` under `@theme inline` when a value is reused (colors, fonts). Add new tokens there if Figma introduces new shared values.
- **Tailwind only** — no inline styles, no CSS modules, no styled-components.
- **Dark mode**: support via `dark:` variants. If Figma doesn't show dark mode, use sensible inversions.

## Quality Checklist (Before Finishing Any Screen)

- [ ] All components are in the correct directories (`ui/` for primitives, `[feature]/` for composed)
- [ ] No hardcoded data in components — all data comes from props
- [ ] Page fetches data from `src/lib/api/*` using mock data
- [ ] Types are defined in `src/types/`
- [ ] Responsive: tested mentally at 375px, 768px, and 1440px widths
- [ ] No `any` types anywhere
- [ ] All images use `next/image`
- [ ] Reused existing UI components where possible