/*
  Warnings:

  - You are about to drop the column `curriculms` on the `statistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "statistics" DROP COLUMN "curriculms",
ADD COLUMN     "curriculums" INTEGER NOT NULL DEFAULT 0;
