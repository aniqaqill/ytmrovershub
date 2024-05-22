-- CreateTable
CREATE TABLE "VolunteerProgram" (
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "VolunteerProgram_pkey" PRIMARY KEY ("userId","programId")
);

-- AddForeignKey
ALTER TABLE "VolunteerProgram" ADD CONSTRAINT "VolunteerProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProgram" ADD CONSTRAINT "VolunteerProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
