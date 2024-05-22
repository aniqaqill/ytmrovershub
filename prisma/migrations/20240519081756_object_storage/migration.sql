/*
  Warnings:

  - You are about to drop the column `image` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "image",
ADD COLUMN     "imageURL" TEXT[];

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "imageURL" TEXT[];
