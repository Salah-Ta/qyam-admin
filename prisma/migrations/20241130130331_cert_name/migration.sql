/*
  Warnings:

  - Added the required column `name` to the `userCertificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "userCertificate" ADD COLUMN     "name" TEXT NOT NULL;
