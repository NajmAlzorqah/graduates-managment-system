import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ─── User definitions ────────────────────────────────────────────

const SEED_USERS = [
  {
    name: "Student User",
    nameAr: "طالب تجريبي",
    email: "student@grads.test",
    academicId: "student",
    password: "student",
    role: "STUDENT" as const,
    isApproved: true,
  },
  {
    name: "Admin User",
    email: "admin@grads.test",
    academicId: "admin",
    password: "admin",
    role: "ADMIN" as const,
    isApproved: true,
  },
  {
    name: "Staff User",
    email: "staff@grads.test",
    academicId: "staff",
    password: "staff",
    role: "STAFF" as const,
    isApproved: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────

async function upsertUser(user: (typeof SEED_USERS)[number]) {
  const passwordHash = await bcrypt.hash(user.password, 12);

  const created = await prisma.user.upsert({
    where: { academicId: user.academicId },
    update: {},
    create: {
      nameAr: "nameAr" in user ? (user.nameAr as string) : null,
      name: user.role === "STUDENT" ? "Saleh Musleh Al-Maslouh" : user.name,
      email: user.email,
      academicId: user.academicId,
      passwordHash,
      role: user.role,
      isApproved: user.isApproved,
    },
  });

  console.log(
    `✅ ${user.role} user ready (academicId: ${user.academicId}, id: ${created.id})`,
  );

  return created;
}

// ─── Seed domain data for the student ────────────────────────────

async function seedStudentData(studentId: string, staffId: string) {
  // --- Student profile ---
  await prisma.studentProfile.upsert({
    where: { userId: studentId },
    update: {},
    create: {
      userId: studentId,
      major: "علوم الحاسوب",
      studentCardNumber: "SC-2024-001",
      graduationYear: 2026,
    },
  });
  console.log("  📋 Student profile ready");

  // --- Graduation form (submitted & approved) ---
  await prisma.graduationForm.upsert({
    where: { userId: studentId },
    update: {},
    create: {
      userId: studentId,
      status: "APPROVED",
      submittedAt: new Date("2026-01-15T10:00:00Z"),
      reviewedById: staffId,
      reviewedAt: new Date("2026-01-20T14:30:00Z"),
    },
  });
  console.log("  📝 Graduation form ready");

  // --- Certificate steps (5 stages) ---
  const existingSteps = await prisma.certificateStep.findMany({
    where: { userId: studentId },
  });

  if (existingSteps.length === 0) {
    const stepData: {
      label: string;
      order: number;
      status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
      updatedById: string | null;
    }[] = [
      {
        label: "تعبئة استمارة التخرج",
        order: 1,
        status: "COMPLETED",
        updatedById: staffId,
      },
      {
        label: "مراجعة البيانات وتأكيدها",
        order: 2,
        status: "COMPLETED",
        updatedById: staffId,
      },
      {
        label: "اعتماد التخرج",
        order: 3,
        status: "IN_PROGRESS",
        updatedById: staffId,
      },
      {
        label: "رفع الشهادة للتعليم العالي",
        order: 4,
        status: "PENDING",
        updatedById: null,
      },
      {
        label: "المصادقة النهائية",
        order: 5,
        status: "PENDING",
        updatedById: null,
      },
    ];
    await prisma.certificateStep.createMany({
      data: stepData.map((s) => ({ userId: studentId, ...s })),
    });
    console.log("  🪜 Certificate steps created");
  } else {
    console.log("  ⏭  Certificate steps already exist");
  }

  // --- Documents ---
  const existingDocs = await prisma.document.count({
    where: { userId: studentId },
  });

  if (existingDocs === 0) {
    const documents: {
      documentType:
        | "PASSPORT"
        | "PERSONAL_PHOTO"
        | "HIGH_SCHOOL_CERT"
        | "NATIONAL_ID";
      label: string;
      fileName: string;
      status: "ACCEPTED" | "PENDING" | "REJECTED";
      reviewedById: string | null;
      reviewedAt: Date | null;
      rejectionReason: string | null;
    }[] = [
      {
        documentType: "PASSPORT",
        label: "جواز السفر",
        fileName: "passport.pdf",
        status: "ACCEPTED",
        reviewedById: staffId,
        reviewedAt: new Date("2026-01-22T09:00:00Z"),
        rejectionReason: null,
      },
      {
        documentType: "PERSONAL_PHOTO",
        label: "صورة شخصية",
        fileName: "photo.jpg",
        status: "ACCEPTED",
        reviewedById: staffId,
        reviewedAt: new Date("2026-01-22T09:05:00Z"),
        rejectionReason: null,
      },
      {
        documentType: "HIGH_SCHOOL_CERT",
        label: "شهادة الثانوية العامة",
        fileName: "highschool_cert.pdf",
        status: "PENDING",
        reviewedById: null,
        reviewedAt: null,
        rejectionReason: null,
      },
      {
        documentType: "NATIONAL_ID",
        label: "البطاقة الشخصية",
        fileName: "national_id.pdf",
        status: "REJECTED",
        reviewedById: staffId,
        reviewedAt: new Date("2026-01-23T11:00:00Z"),
        rejectionReason: "الصورة غير واضحة، يرجى إعادة الرفع",
      },
    ];

    await prisma.document.createMany({
      data: documents.map((d) => ({
        userId: studentId,
        documentType: d.documentType,
        label: d.label,
        fileName: d.fileName,
        filePath: `uploads/${studentId}/${d.fileName}`,
        fileSize: 1024,
        mimeType: d.fileName.endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
        status: d.status,
        reviewedById: d.reviewedById,
        reviewedAt: d.reviewedAt,
        rejectionReason: d.rejectionReason,
      })),
    });
    console.log("  📄 Documents created (4)");
  } else {
    console.log(`  ⏭  Documents already exist (${existingDocs})`);
  }

  // --- Notifications ---
  const existingNotifs = await prisma.notification.count({
    where: { userId: studentId },
  });

  if (existingNotifs === 0) {
    const notifications = [
      {
        title: "تمت الموافقة على حسابك",
        message:
          "تمت الموافقة على حسابك من قبل الإدارة. يمكنك الآن الدخول والبدء بإجراءات التخرج.",
        isRead: true,
        sentById: staffId,
        createdAt: new Date("2026-01-10T08:00:00Z"),
      },
      {
        title: "تم قبول استمارة التخرج",
        message: "تم مراجعة واعتماد استمارة التخرج الخاصة بك.",
        isRead: true,
        sentById: staffId,
        createdAt: new Date("2026-01-20T14:35:00Z"),
      },
      {
        title: "تم قبول جواز السفر",
        message: "تم التحقق من وثيقة جواز السفر وقبولها.",
        isRead: true,
        sentById: staffId,
        createdAt: new Date("2026-01-22T09:10:00Z"),
      },
      {
        title: "رفض البطاقة الشخصية",
        message:
          "تم رفض وثيقة البطاقة الشخصية. السبب: الصورة غير واضحة، يرجى إعادة الرفع.",
        isRead: false,
        sentById: staffId,
        createdAt: new Date("2026-01-23T11:05:00Z"),
      },
      {
        title: "تحديث مراحل الشهادة",
        message:
          "تم تحديث حالة المرحلة الثالثة (ارسال الشهادة للتعليم العالي) إلى قيد التنفيذ.",
        isRead: false,
        sentById: staffId,
        createdAt: new Date("2026-02-01T10:00:00Z"),
      },
    ];

    await prisma.notification.createMany({
      data: notifications.map((n) => ({ userId: studentId, ...n })),
    });
    console.log("  🔔 Notifications created (5)");
  } else {
    console.log(`  ⏭  Notifications already exist (${existingNotifs})`);
  }
}

// --- Seed Admin Analytics ---

async function seedAdminAnalytics() {
  const count = await prisma.analytics.count();
  if (count === 0) {
    await prisma.analytics.createMany({
      data: [
        { type: "TRAFFIC_SOURCE", name: "Google", value: 52.1 },
        { type: "TRAFFIC_SOURCE", name: "YouTube", value: 22.8 },
        { type: "TRAFFIC_SOURCE", name: "Instagram", value: 13.9 },
        { type: "TRAFFIC_SOURCE", name: "Pinterest", value: 11.2 },
        { type: "LOCATION", name: "United States", value: 52.1 },
        { type: "LOCATION", name: "Canada", value: 22.8 },
        { type: "LOCATION", name: "Mexico", value: 13.9 },
        { type: "LOCATION", name: "Other", value: 11.2 },
        { type: "DEVICE", name: "Linux", value: 40 },
        { type: "DEVICE", name: "Mac", value: 80 },
        { type: "DEVICE", name: "iOS", value: 60 },
        { type: "DEVICE", name: "Windows", value: 90 },
        { type: "DEVICE", name: "Android", value: 30 },
      ],
    });
    console.log("  📊 Admin analytics ready");
  } else {
    console.log(`  ⏭  Admin analytics already exist (${count})`);
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  // Create / upsert all users
  await upsertUser(SEED_USERS[1]);
  const staff = await upsertUser(SEED_USERS[2]);
  const student = await upsertUser(SEED_USERS[0]);

  // Seed domain data for the student user
  console.log("\n📦 Seeding domain data for student...");
  await seedStudentData(student.id, staff.id);

  console.log("\n📊 Seeding admin analytics...");
  await seedAdminAnalytics();

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
