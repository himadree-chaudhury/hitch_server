/*
  Warnings:

  - You are about to drop the column `eventCategoryId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_eventCategoryId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventCategoryId",
DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- CreateTable
CREATE TABLE "EventCategoryEvent" (
    "eventId" TEXT NOT NULL,
    "eventCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCategoryEvent_pkey" PRIMARY KEY ("eventId","eventCategoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventCategoryEvent_eventId_key" ON "EventCategoryEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategoryEvent_eventCategoryId_key" ON "EventCategoryEvent"("eventCategoryId");

-- AddForeignKey
ALTER TABLE "EventCategoryEvent" ADD CONSTRAINT "EventCategoryEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategoryEvent" ADD CONSTRAINT "EventCategoryEvent_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
