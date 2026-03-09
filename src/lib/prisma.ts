import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // TODO: When connecting to the database, pass a driver adapter:
  // import { PrismaPg } from "@prisma/adapter-pg";
  // return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  return new PrismaClient({} as never);
}

// Lazy-initialized — the client is only created when first accessed at runtime,
// not at module import time. This prevents build-time crashes.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop);
  },
});
