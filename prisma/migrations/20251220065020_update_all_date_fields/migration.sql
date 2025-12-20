/*
  Warnings:

  - You are about to drop the column `created_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `EventCategory` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `EventCategory` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `EventParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `EventReview` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `EventReview` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `HostProfile` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `HostProfile` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `HostReview` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `HostReview` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HostProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HostReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EventCategory" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EventParticipant" DROP COLUMN "joined_at",
DROP COLUMN "updated_at",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EventReview" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HostProfile" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HostReview" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
