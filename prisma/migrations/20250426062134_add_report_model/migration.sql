-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "volunteerHours" DOUBLE PRECISION NOT NULL,
    "economicValue" DOUBLE PRECISION NOT NULL,
    "volunteerOpportunities" INTEGER NOT NULL,
    "activitiesCount" INTEGER NOT NULL,
    "volunteerCount" INTEGER NOT NULL,
    "skillsEconomicValue" DOUBLE PRECISION NOT NULL,
    "skillsTrainedCount" INTEGER NOT NULL,
    "attachedFiles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
