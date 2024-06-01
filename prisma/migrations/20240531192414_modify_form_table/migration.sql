/*
  Warnings:

  - You are about to drop the column `approved` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `imageURL` on the `Form` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[volunteerId,programId]` on the table `Form` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "approved",
DROP COLUMN "imageURL",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "status" "FormStatus" NOT NULL DEFAULT 'SUBMITTED';

-- CreateIndex
CREATE UNIQUE INDEX "Form_volunteerId_programId_key" ON "Form"("volunteerId", "programId");
