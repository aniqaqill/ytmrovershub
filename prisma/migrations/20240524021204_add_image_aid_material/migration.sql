/*
  Warnings:

  - Added the required column `Image` to the `AidMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AidMaterial" ADD COLUMN     "Image" TEXT NOT NULL;
