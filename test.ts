import { prisma } from "./src/lib/prisma";

async function run() {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    await prisma.user.count({
      where: { role: "STUDENT", createdAt: { gte: start, lt: end } },
    });
    console.log("success");
  } catch (e: unknown) {
    console.error("ERROR");
    if (e instanceof Error) {
      console.error((e as { code?: string }).code);
      console.error(e.message);
    }
  }
}
run();
