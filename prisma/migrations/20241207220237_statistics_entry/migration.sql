-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL DEFAULT 'stats',
    "registeredUsers" INTEGER NOT NULL DEFAULT 0,
    "curriculms" INTEGER NOT NULL DEFAULT 0,
    "trainingHours" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);
