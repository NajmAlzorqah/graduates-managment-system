/*
  Warnings:

  - You are about to drop the column `order` on the `StaffTodo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StaffTodo" DROP COLUMN "order";

-- CreateIndex
CREATE INDEX "StaffTodo_staffId_idx" ON "StaffTodo"("staffId");
