-- CreateTable
CREATE TABLE "StaffTodo" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTodo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffTodo" ADD CONSTRAINT "StaffTodo_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
