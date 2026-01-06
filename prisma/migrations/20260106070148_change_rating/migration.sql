-- DropIndex
DROP INDEX "EventReview_eventId_key";

-- DropIndex
DROP INDEX "EventReview_reviewerId_key";

-- DropIndex
DROP INDEX "HostReview_eventId_key";

-- DropIndex
DROP INDEX "HostReview_hostId_key";

-- DropIndex
DROP INDEX "HostReview_reviewerId_key";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "HostProfile" ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0;
