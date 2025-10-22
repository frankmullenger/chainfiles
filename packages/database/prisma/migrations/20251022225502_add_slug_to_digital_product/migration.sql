/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `DigitalProduct` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `DigitalProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DigitalProduct" ADD COLUMN     "slug" VARCHAR(21) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DigitalProduct_slug_key" ON "DigitalProduct"("slug");

-- CreateIndex
CREATE INDEX "IX_DigitalProduct_slug" ON "DigitalProduct"("slug");
