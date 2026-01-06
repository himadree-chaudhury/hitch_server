/*
  Warnings:

  - You are about to drop the column `stripe_charge_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_intent_id` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripe_charge_id",
DROP COLUMN "stripe_payment_intent_id",
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
