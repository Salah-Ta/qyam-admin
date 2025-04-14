/*
  Warnings:

  - You are about to drop the `UserCertificate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCertificate" DROP CONSTRAINT "UserCertificate_userId_fkey";

-- DropTable
DROP TABLE "UserCertificate";

-- CreateTable
CREATE TABLE "userCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateKey" TEXT NOT NULL,

    CONSTRAINT "userCertificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userCertificate" ADD CONSTRAINT "userCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
