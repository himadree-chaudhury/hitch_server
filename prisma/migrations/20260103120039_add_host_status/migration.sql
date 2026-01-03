-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "HostProfile" ADD COLUMN     "hostStatus" "HostStatus" NOT NULL DEFAULT 'PENDING';
