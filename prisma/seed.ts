import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  {
    name: "Student User",
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

async function main() {
  for (const user of SEED_USERS) {
    const existing = await prisma.user.findUnique({
      where: { academicId: user.academicId },
    });

    if (existing) {
      console.log(
        `⏭  ${user.role} user already exists (academicId: ${user.academicId})`,
      );
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);

    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        academicId: user.academicId,
        passwordHash,
        role: user.role,
        isApproved: user.isApproved,
      },
    });

    // Create student profile and default certificate steps for STUDENT role
    if (user.role === "STUDENT") {
      await prisma.studentProfile.create({
        data: { userId: created.id, major: "" },
      });

      await prisma.certificateStep.createMany({
        data: [
          {
            userId: created.id,
            label: "Fill graduation form",
            order: 1,
            status: "PENDING",
          },
          {
            userId: created.id,
            label: "Verify data",
            order: 2,
            status: "PENDING",
          },
          {
            userId: created.id,
            label: "Send to higher education",
            order: 3,
            status: "PENDING",
          },
          {
            userId: created.id,
            label: "Authenticate certificate",
            order: 4,
            status: "PENDING",
          },
        ],
      });
    }

    console.log(
      `✅ Created ${user.role} user (academicId: ${user.academicId})`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
