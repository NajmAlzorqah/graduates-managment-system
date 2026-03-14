/*
  Warnings:

  - You are about to drop the `StaffTodo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StaffTodo" DROP CONSTRAINT "StaffTodo_staffId_fkey";

-- DropTable
DROP TABLE "StaffTodo";

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analytics_type_idx" ON "Analytics"("type");
