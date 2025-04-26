-- CreateTable
CREATE TABLE "school" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "eduAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_eduAdminId_fkey" FOREIGN KEY ("eduAdminId") REFERENCES "eduAdministration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
