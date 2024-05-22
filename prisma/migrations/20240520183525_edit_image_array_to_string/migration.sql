/*
  Warnings:

  - You are about to drop the column `imageURL` on the `Program` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Program" DROP COLUMN "imageURL",
ADD COLUMN     "image" TEXT NOT NULL DEFAULT 'program/this%20is%20fine.jpg';
