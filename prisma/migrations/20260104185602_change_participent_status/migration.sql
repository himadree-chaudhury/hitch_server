/*
  Warnings:

  - The values [CONFIRMED] on the enum `ParticipantStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ParticipantStatus_new" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'WAITLISTED');
ALTER TABLE "public"."EventParticipant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EventParticipant" ALTER COLUMN "status" TYPE "ParticipantStatus_new" USING ("status"::text::"ParticipantStatus_new");
ALTER TYPE "ParticipantStatus" RENAME TO "ParticipantStatus_old";
ALTER TYPE "ParticipantStatus_new" RENAME TO "ParticipantStatus";
DROP TYPE "public"."ParticipantStatus_old";
ALTER TABLE "EventParticipant" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
COMMIT;
