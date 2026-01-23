/*
  Warnings:

  - Added the required column `hostId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "hostId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "HostProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
