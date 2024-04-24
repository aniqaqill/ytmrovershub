/*
  Warnings:

  - You are about to drop the column `coordinatorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `volunteerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Coordinator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Volunteer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProgramToVolunteer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "Program" DROP CONSTRAINT "Program_coordinatorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_coordinatorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "_ProgramToVolunteer" DROP CONSTRAINT "_ProgramToVolunteer_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProgramToVolunteer" DROP CONSTRAINT "_ProgramToVolunteer_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "coordinatorId",
DROP COLUMN "volunteerId";

-- DropTable
DROP TABLE "Coordinator";

-- DropTable
DROP TABLE "Volunteer";

-- DropTable
DROP TABLE "_ProgramToVolunteer";

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
