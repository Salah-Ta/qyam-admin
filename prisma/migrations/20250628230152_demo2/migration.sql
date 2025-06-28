/*
  Warnings:

  - You are about to drop the column `categoryId` on the `material` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "material" DROP CONSTRAINT "material_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_eduAdminId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_regionId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_schoolId_fkey";

-- AlterTable
ALTER TABLE "material" DROP COLUMN "categoryId";
