/*
  Warnings:

  - You are about to drop the column `regionId` on the `eduAdministration` table. All the data in the column will be lost.
  - You are about to drop the column `eduAdminId` on the `school` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "eduAdministration" DROP CONSTRAINT "eduAdministration_regionId_fkey";

-- DropForeignKey
ALTER TABLE "school" DROP CONSTRAINT "school_eduAdminId_fkey";

-- AlterTable
ALTER TABLE "eduAdministration" DROP COLUMN "regionId";

-- AlterTable
ALTER TABLE "school" DROP COLUMN "eduAdminId";
