
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || "" });
  const prisma = new PrismaClient({ adapter });
  try {
    const profiles = await prisma.studentProfile.findMany({
      select: { major: true },
    });
    const distinctMajors = Array.from(new Set(profiles.map(p => p.major).filter(Boolean))) as string[];
    console.log("Distinct majors in StudentProfile:", distinctMajors);

    for (const name of distinctMajors) {
      await prisma.major.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      console.log(`Upserted major: ${name}`);
    }
  } catch (error: any) {
    console.error("Error during migration:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
