-- CreateTable
CREATE TABLE "eduAdministration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eduAdministration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "eduAdministration" ADD CONSTRAINT "eduAdministration_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
