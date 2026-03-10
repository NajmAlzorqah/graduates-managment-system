# Plan: Graduation System Backend Implementation

## TL;DR
Replace all mock data/auth with a real PostgreSQL-backed backend. Extend the Prisma schema with all SRS domain models (students, documents, certificate steps, notifications, certificates, graduation forms), implement production-ready bcrypt authentication with admin approval flow, build full CRUD in `src/lib/api/` backed by Prisma, create REST API routes for client-side mutations, add comprehensive Zod validation, seed the DB with realistic data, and wire up Next.js middleware for route protection. The frontend `src/lib/api/` layer stays as the single data-access point — only function bodies change from mock → Prisma.

## Decisions
- **File uploads**: Local disk storage at `uploads/` (gitignored), served via auth-protected API route
- **Account approval**: Students register → status pending → admin approves → can log in. Unapproved students cannot log in (authorize returns null)
- **Graduation form**: Separate submission after registration (not part of registration)
- **Excel import/export**: Deferred to later phase
- **Notifications**: In-app only (stored in DB, shown on student notifications page)
- **Auth strategy**: JWT (credentials provider), no Prisma adapter for Auth.js (adapter is for OAuth)
- **API layer pattern**: `src/lib/api/` calls Prisma directly (Server Components); `src/app/api/` routes for client-side mutations

---

## Phase 1: Environment & Database Schema
> Foundational — blocks all other phases

### Steps

1. **Create `.env` file** with:
   - `DATABASE_URL=postgresql://grads:grads_secret@localhost:5432/grads_system`
   - `AUTH_SECRET=<generated-secret>`
   - `AUTH_TRUST_HOST=true`

2. **Install bcryptjs**: `bun add bcryptjs && bun add -d @types/bcryptjs`

3. **Extend `prisma/schema.prisma`** — add to the existing User model and create new models:

   **User model changes:**
   - Add `academicId String @unique`
   - Add `passwordHash String`
   - Add `nameAr String?` (Arabic name, used by student home)
   - Add `isApproved Boolean @default(false)`
   - Add relations to all new domain models

   **New `StudentProfile` model:**
   - `id`, `userId` (unique FK → User), `studentCardNumber`, `major`, `graduationYear`

   **New `GraduationForm` model:**
   - `id`, `userId` (unique FK → User), `status` (enum: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED), `submittedAt`, `reviewedById` (FK → User), `reviewedAt`

   **New `Document` model:**
   - `id`, `userId` (FK → User), `documentType` (enum: PASSPORT, PERSONAL_PHOTO, HIGH_SCHOOL_CERT, NATIONAL_ID, OTHER), `label`, `fileName`, `filePath`, `fileSize`, `mimeType`, `status` (enum: PENDING, ACCEPTED, REJECTED), `reviewedById` (FK → User), `reviewedAt`, `rejectionReason`

   **New `CertificateStep` model:**
   - `id`, `userId` (FK → User), `label`, `order`, `status` (enum: PENDING, IN_PROGRESS, COMPLETED), `updatedById` (FK → User)
   - Unique constraint on `[userId, order]`

   **New `Notification` model:**
   - `id`, `userId` (FK → User), `title`, `message`, `isRead` (default false), `sentById` (FK → User), `createdAt`

   **New `Certificate` model:**
   - `id`, `userId` (unique FK → User), `fileName`, `filePath`, `uploadedById` (FK → User), `createdAt`

4. **Fix `src/lib/prisma.ts`**: Remove the `{} as never` hack. Use standard PrismaClient with lazy initialization via global cache (keep the Proxy pattern for build safety, but fix the client constructor).

5. **Run migrations**: `docker compose up -d` → `bunx prisma migrate dev --name add_domain_models` → `bunx prisma generate`

### Relevant files
- `prisma/schema.prisma` — extend with all models above (reuse existing User/Account/Session/VerificationToken)
- `src/lib/prisma.ts` — fix `createPrismaClient()` to use standard constructor without `as never`
- `.env` — create new
- `.gitignore` — add `uploads/`

---

## Phase 2: Authentication (Production-Ready)
> Depends on Phase 1

### Steps

1. **Update `src/lib/auth.ts`**:
   - Remove `MOCK_USERS` array entirely
   - In `authorize()`: query `prisma.user.findUnique({ where: { academicId } })`
   - Verify password with `bcryptjs.compare(password, user.passwordHash)`
   - Check `user.isApproved === true` — return null with appropriate handling if not approved
   - Return `{ id: user.id, name: user.name, role: user.role }`

2. **Update `src/lib/actions/auth.ts`** register action:
   - Check if `academicId` or `email` already exists via Prisma
   - Hash password: `await bcrypt.hash(password, 12)`
   - Create User + StudentProfile in `prisma.$transaction()`:
     - User: `{ name, email, academicId, passwordHash, role: "STUDENT", isApproved: false }`
     - StudentProfile: `{ major: "" }` (placeholder, filled later via graduation form)
   - Create 4 default CertificateSteps for the student (fill form, verify data, send to higher ed, authenticate)
   - Return `{ success: true }` → frontend redirects to `/pending`

3. **Update `src/lib/validations/auth.ts`**:
   - `loginSchema`: keep as-is (academicId + password, both required)
   - `registerSchema`: strengthen password rules (min 8, must contain uppercase + lowercase + digit), validate academicId format (alphanumeric, 3-20 chars)

4. **Create `src/middleware.ts`** (proper Next.js middleware):
   - Move logic from `src/proxy.ts`
   - Export `config.matcher` excluding `/_next/static`, `/_next/image`, `/favicon.ico`, `/api/auth/*`
   - Enforce: unauthenticated → redirect to `/login`; authenticated on public pages → redirect to role dashboard; role-based prefix guard (`/admin/*` → ADMIN only, etc.)

### Relevant files
- `src/lib/auth.ts` — replace mock authorize with Prisma + bcrypt (reference existing `loginSchema` from `src/lib/validations/auth.ts`)
- `src/lib/actions/auth.ts` — real register with `prisma.$transaction`, reference `registerSchema`
- `src/lib/validations/auth.ts` — strengthen password validation
- `src/middleware.ts` — create new (based on logic from `src/proxy.ts`)
- `src/proxy.ts` — delete after middleware is created

---

## Phase 3: Types
> Parallel with Phase 2

### Steps

1. **Update `src/types/user.ts`**: Add `academicId`, `nameAr`, `isApproved` fields to `User` type

2. **Update `src/types/student.ts`**:
   - Extend `Student` type: add `academicId`, `studentCardNumber`, `major`, `graduationYear`
   - Keep `CertificateStep`, `DocumentItem`, `StudentProfile`, `StudentHomeData` types compatible with existing frontend components (these are "view model" types)
   - Add `StudentWithProfile` type for admin views

3. **Create `src/types/document.ts`**: `Document` (full DB shape), `DocumentType`, `DocumentStatus` types

4. **Create `src/types/notification.ts`**: `Notification` type

5. **Create `src/types/certificate.ts`**: `Certificate` type

6. **Create `src/types/graduation-form.ts`**: `GraduationForm`, `GraduationFormStatus` types

### Relevant files
- `src/types/user.ts` — extend existing
- `src/types/student.ts` — extend existing, keep backward-compatible with `CertificateStatusCard` and `DocumentsStatusCard` components
- `src/types/document.ts` — create new
- `src/types/notification.ts` — create new
- `src/types/certificate.ts` — create new
- `src/types/graduation-form.ts` — create new

---

## Phase 4: Zod Validations
> Parallel with Phase 2

### Steps

1. **Update `src/lib/validations/student.ts`**: Update `createStudentSchema` to match new fields; add `updateStudentSchema`, `updateStudentProfileSchema`

2. **Create `src/lib/validations/document.ts`**: `uploadDocumentSchema` (documentType, label), `reviewDocumentSchema` (status, rejectionReason optional when rejecting)

3. **Create `src/lib/validations/notification.ts`**: `createNotificationSchema` (title, message, userId OR userIds for group send), `markReadSchema`

4. **Create `src/lib/validations/certificate.ts`**: `uploadCertificateSchema` (userId)

5. **Create `src/lib/validations/graduation-form.ts`**: `submitGraduationFormSchema` (academic details), `reviewGraduationFormSchema` (status, comments)

6. **Create `src/lib/validations/certificate-step.ts`**: `updateStepStatusSchema` (status)

### Relevant files
- `src/lib/validations/student.ts` — update
- `src/lib/validations/document.ts` — create
- `src/lib/validations/notification.ts` — create
- `src/lib/validations/certificate.ts` — create
- `src/lib/validations/graduation-form.ts` — create
- `src/lib/validations/certificate-step.ts` — create

---

## Phase 5: API Layer — CRUD Functions
> Depends on Phase 1, 3, 4. This is the main data access layer the frontend consumes.

### Steps

All functions in `src/lib/api/` call Prisma directly (server-side only). They transform Prisma results into frontend-compatible types from `src/types/`.

1. **Update `src/lib/api/students.ts`** — replace mock:
   - `getStudents()`: `prisma.user.findMany({ where: { role: "STUDENT" }, include: { studentProfile: true } })` → map to `Student[]`
   - `getStudentById(id)`: single student with profile, documents, steps
   - `createStudent(data)`: admin creates student (user + profile + default steps)
   - `updateStudent(id, data)`: update user + profile fields
   - `deleteStudent(id)`: delete user cascade
   - `approveStudent(id)`: set `isApproved: true`
   - `getUnapprovedStudents()`: list pending registrations

2. **Update `src/lib/api/student-home.ts`** — replace mock:
   - `getStudentHomeData(userId)`: fetch user (nameAr) + studentProfile (department/major) + certificateSteps + documents → map to `StudentHomeData`

3. **Create `src/lib/api/documents.ts`**:
   - `getDocumentsByStudent(userId)`: list documents
   - `createDocument(userId, data, file)`: write file to `uploads/<userId>/`, create DB record
   - `updateDocumentStatus(docId, status, reviewerId, reason?)`: staff review
   - `deleteDocument(docId)`: remove file from disk + DB record
   - `getDocumentFile(docId)`: read file from disk for download (with auth check)

4. **Create `src/lib/api/notifications.ts`**:
   - `getNotifications(userId)`: list, ordered by createdAt desc
   - `getUnreadCount(userId)`: count
   - `createNotification(senderId, userId, title, message)`: single
   - `createGroupNotification(senderId, userIds, title, message)`: batch insert
   - `markAsRead(notificationId)`: update isRead
   - `markAllAsRead(userId)`: update all for user

5. **Create `src/lib/api/certificate-steps.ts`**:
   - `getStepsByStudent(userId)`: ordered by `order`
   - `updateStepStatus(stepId, status, staffId)`: update status
   - `createDefaultSteps(userId)`: create 4 standard steps for a new student

6. **Create `src/lib/api/certificates.ts`**:
   - `getCertificate(userId)`: get student's certificate record
   - `uploadCertificate(userId, file, staffId)`: save PDF + create/update record
   - `deleteCertificate(userId)`: remove file + record

7. **Create `src/lib/api/graduation-forms.ts`**:
   - `getGraduationForm(userId)`: get form
   - `submitGraduationForm(userId, data)`: create or update
   - `reviewGraduationForm(formId, status, staffId)`: staff review
   - `getAllForms(filter?)`: staff view of all submitted forms

### Relevant files
- `src/lib/api/students.ts` — rewrite (reference `prisma.user` + `prisma.studentProfile`)
- `src/lib/api/student-home.ts` — rewrite (compose from user + profile + steps + documents)
- `src/lib/api/documents.ts` — create
- `src/lib/api/notifications.ts` — create
- `src/lib/api/certificate-steps.ts` — create
- `src/lib/api/certificates.ts` — create
- `src/lib/api/graduation-forms.ts` — create

---

## Phase 6: API Routes (REST Endpoints)
> Depends on Phase 4, 5. For client-side mutations and external access.

All routes: validate input with Zod `safeParse`, check auth session via `auth()`, enforce role authorization, return proper HTTP status codes.

### Steps

1. **Update `src/app/api/students/route.ts`** — use real CRUD from `src/lib/api/students.ts`
2. **Create `src/app/api/students/[id]/route.ts`** — GET, PUT, DELETE (admin/staff only)
3. **Create `src/app/api/students/[id]/approve/route.ts`** — POST (admin only)
4. **Create `src/app/api/students/[id]/documents/route.ts`** — GET (staff), POST with multipart file upload (student)
5. **Create `src/app/api/documents/[id]/route.ts`** — GET (download file), PUT (review status — staff), DELETE
6. **Create `src/app/api/students/[id]/steps/route.ts`** — GET, PUT (staff updates step status)
7. **Create `src/app/api/notifications/route.ts`** — GET (list for current user), POST (staff sends)
8. **Create `src/app/api/notifications/[id]/route.ts`** — PUT (mark read), DELETE
9. **Create `src/app/api/notifications/read-all/route.ts`** — POST (mark all read for current user)
10. **Create `src/app/api/certificates/[userId]/route.ts`** — GET (download), POST multipart (staff uploads)
11. **Create `src/app/api/graduation-form/route.ts`** — GET (current user's form), POST (submit)
12. **Create `src/app/api/graduation-form/[id]/review/route.ts`** — POST (staff reviews)
13. **Create `src/app/api/student/home/route.ts`** — GET (student dashboard data for current user)
14. **Create `src/app/api/uploads/[...path]/route.ts`** — Auth-protected file serving route

### Relevant files
- `src/app/api/students/route.ts` — update existing
- All other routes listed above — create new

---

## Phase 7: Seed Data
> Depends on Phase 1. Can run in parallel with Phases 2-6.

### Steps

1. **Create `prisma/seed.ts`**:
   - 1 Admin: academicId `admin001`, password `Admin@123`, approved
   - 2 Staff: academicIds `staff001`, `staff002`, approved
   - 10 Students with Arabic/English names, various departments (CS, IT, SE, IS):
     - 3 fully approved, graduation complete (all steps completed, all docs accepted, certificate uploaded)
     - 3 approved, in-progress (some steps done, some docs pending)
     - 2 approved, early stage (form submitted, no docs yet)
     - 2 unapproved (just registered, pending admin approval)
   - Documents for each approved student (passport, photo, high school cert, national ID)
   - Certificate steps at appropriate stages per student
   - 5-10 notifications spread across students
   - 1 graduation certificate PDF record for a completed student
   - All passwords hashed with bcryptjs

2. **Add seed script to `package.json`**: `"seed": "bunx prisma db seed"` 
3. **Add seed config to `prisma.config.ts`** (or `package.json` prisma config)

### Relevant files
- `prisma/seed.ts` — create new
- `package.json` — add prisma.seed config

---

## Verification

1. **Database**: `docker compose up -d` → `bunx prisma migrate dev` succeeds → `bunx prisma studio` shows all tables with correct columns and relations
2. **Seed**: `bunx prisma db seed` populates all tables with realistic test data visible in Prisma Studio
3. **Auth flow**: 
   - Register a new student → user created in DB with hashed password, `isApproved: false` → redirected to `/pending`
   - Login with unapproved student → error "Account pending approval"
   - Login with `admin001/Admin@123` → redirected to `/admin`
   - Login with seeded approved student → redirected to `/student` → sees real data from DB
4. **Student home page**: `/student` renders profile (Arabic name + department), certificate steps, and document statuses from DB (not mock)
5. **Admin students page**: `/admin/students` lists students from DB with correct count
6. **Middleware**: Unauthenticated access to `/student` → redirected to `/login`; student accessing `/admin` → redirected away
7. **API routes**: `curl` or browser test: `GET /api/students` returns real student data; `POST /api/students` with valid body creates student; invalid body returns 400
8. **Build**: `bun run build` succeeds without errors
9. **Lint**: `bun run lint` passes

---

## Scope
**Included**: Database schema, auth, CRUD API layer, API routes, types, validations, seed data, middleware
**Excluded**: Excel import/export, email notifications, file upload UI components, QR code, mobile app, LDAP/SSO, advanced analytics
**Note**: Mock data files (`src/lib/mock/`) can be kept as fallback but will no longer be used by the API layer
