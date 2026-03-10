import path from "node:path";
// Load .env file for Prisma CLI
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "bun prisma/seed.ts",
  },
});
