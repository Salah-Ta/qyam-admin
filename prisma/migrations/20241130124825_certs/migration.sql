/*
  Warnings:

  - Added the required column `contentType` to the `userCertificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `userCertificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "userCertificate" ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
