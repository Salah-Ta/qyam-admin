-- AlterTable
ALTER TABLE "user" ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'first',
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'none';
