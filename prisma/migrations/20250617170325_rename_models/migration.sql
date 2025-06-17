-- Rename main tables
ALTER TABLE "Service" RENAME TO "Therapy";
ALTER TABLE "Resource" RENAME TO "Advice";

-- Rename foreign key columns
ALTER TABLE "Appointment" RENAME COLUMN "serviceId" TO "therapyId";
ALTER TABLE "Advice" RENAME COLUMN "serviceId" TO "therapyId";

-- Recreate foreign key constraints with new names
ALTER TABLE "Appointment" 
  ADD CONSTRAINT "Appointment_therapyId_fkey" 
  FOREIGN KEY ("therapyId") REFERENCES "Therapy"("id") ON DELETE CASCADE;

ALTER TABLE "Advice" 
  ADD CONSTRAINT "Advice_therapyId_fkey" 
  FOREIGN KEY ("therapyId") REFERENCES "Therapy"("id") ON DELETE CASCADE;
