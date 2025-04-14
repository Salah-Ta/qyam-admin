-- AlterTable
ALTER TABLE "user" ADD COLUMN     "noStudents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trainingHours" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "acceptenceState" SET DEFAULT 'idle';

-- CreateTable
CREATE TABLE "UserCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateKey" TEXT NOT NULL,

    CONSTRAINT "UserCertificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserCertificate" ADD CONSTRAINT "UserCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
