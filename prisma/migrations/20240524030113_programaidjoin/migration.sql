/*
  Warnings:

  - You are about to drop the column `programId` on the `AidMaterial` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AidMaterial" DROP CONSTRAINT "AidMaterial_programId_fkey";

-- AlterTable
ALTER TABLE "AidMaterial" DROP COLUMN "programId";

-- CreateTable
CREATE TABLE "ProgramAidMaterial" (
    "id" TEXT NOT NULL,
    "quantityUsed" INTEGER NOT NULL,
    "programId" TEXT NOT NULL,
    "aidMaterialId" TEXT NOT NULL,

    CONSTRAINT "ProgramAidMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramAidMaterial_programId_aidMaterialId_key" ON "ProgramAidMaterial"("programId", "aidMaterialId");

-- AddForeignKey
ALTER TABLE "ProgramAidMaterial" ADD CONSTRAINT "ProgramAidMaterial_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAidMaterial" ADD CONSTRAINT "ProgramAidMaterial_aidMaterialId_fkey" FOREIGN KEY ("aidMaterialId") REFERENCES "AidMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
