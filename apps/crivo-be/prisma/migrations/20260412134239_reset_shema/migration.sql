/*
  Warnings:

  - The values [INTERMEDIATE,PREMIUM] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MODERATOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `featuredInHomepage` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `featuredInSearch` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxPhotos` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxProperties` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxVideos` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `cancelReason` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `canceledAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');
ALTER TABLE "Plan" ALTER COLUMN "type" TYPE "PlanType_new" USING ("type"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "public"."PlanType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('OWNER', 'ADMIN', 'USER', 'SUPPORT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropIndex
DROP INDEX "Plan_isActive_idx";

-- DropIndex
DROP INDEX "Subscription_endDate_idx";

-- DropIndex
DROP INDEX "Subscription_status_idx";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "featuredInHomepage",
DROP COLUMN "featuredInSearch",
DROP COLUMN "maxPhotos",
DROP COLUMN "maxProperties",
DROP COLUMN "maxVideos",
ADD COLUMN     "maxCompany" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "maxTransactions" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "maxUsers" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "amount",
DROP COLUMN "cancelReason",
DROP COLUMN "canceledAt",
DROP COLUMN "paymentId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyId" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");

-- CreateIndex
CREATE INDEX "Subscription_companyId_idx" ON "Subscription"("companyId");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
