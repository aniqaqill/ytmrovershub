/*
  Warnings:

  - You are about to drop the column `endDate` on the `Program` table. All the data in the column will be lost.
  - Added the required column `time` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Program" DROP COLUMN "endDate",
ADD COLUMN     "time" TEXT NOT NULL;
