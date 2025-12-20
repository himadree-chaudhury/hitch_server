/*
  Warnings:

  - You are about to drop the column `current_participants` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `host_id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `is_featured` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `joining_fee` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `max_participants` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `min_participants` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventParticipantId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `average_rating` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `rating_count` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hostId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `EventParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joiningFee` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minParticipants` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `EventReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `HostProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `HostReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_host_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_eventId_fkey";

-- DropIndex
DROP INDEX "Event_host_id_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "current_participants",
DROP COLUMN "end_time",
DROP COLUMN "host_id",
DROP COLUMN "image_url",
DROP COLUMN "is_featured",
DROP COLUMN "joining_fee",
DROP COLUMN "max_participants",
DROP COLUMN "min_participants",
DROP COLUMN "start_time",
ADD COLUMN     "currentParticipants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hostId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joiningFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER,
ADD COLUMN     "minParticipants" INTEGER NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalViews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "EventParticipant" ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "EventReview" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HostProfile" ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ratingCount" INTEGER DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HostReview" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "eventParticipantId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider" NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "average_rating",
DROP COLUMN "first_name",
DROP COLUMN "image_url",
DROP COLUMN "last_name",
DROP COLUMN "rating_count",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_hostId_key" ON "Event"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_paymentId_key" ON "EventParticipant"("paymentId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "HostProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
