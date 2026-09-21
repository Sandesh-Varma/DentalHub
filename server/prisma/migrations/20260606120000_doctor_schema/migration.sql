-- Align DB with clinic model: doctors table, clinic owner flag, booking audit

-- Users: clinic owner flag (solo-practice doctor)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_clinic_owner" BOOLEAN NOT NULL DEFAULT false;

-- Rename dentists → doctors
ALTER TABLE "dentists" RENAME TO "doctors";

-- Schedules: dentist_id → doctor_id
ALTER TABLE "schedules" RENAME COLUMN "dentist_id" TO "doctor_id";
ALTER INDEX "schedules_dentist_id_day_of_week_key" RENAME TO "schedules_doctor_id_day_of_week_key";
ALTER TABLE "schedules" RENAME CONSTRAINT "schedules_dentist_id_fkey" TO "schedules_doctor_id_fkey";

-- Appointments: dentist_id → doctor_id, who booked
ALTER TABLE "appointments" RENAME COLUMN "dentist_id" TO "doctor_id";
ALTER INDEX "appointments_dentist_id_appointment_date_start_time_key" RENAME TO "appointments_doctor_id_appointment_date_start_time_key";
ALTER TABLE "appointments" RENAME CONSTRAINT "appointments_dentist_id_fkey" TO "appointments_doctor_id_fkey";
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "booked_by_user_id" TEXT;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_booked_by_user_id_fkey"
  FOREIGN KEY ("booked_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Dentists user FK name
ALTER TABLE "doctors" RENAME CONSTRAINT "dentists_user_id_fkey" TO "doctors_user_id_fkey";
ALTER INDEX "dentists_user_id_key" RENAME TO "doctors_user_id_key";

-- Mark existing DOCTOR users as clinic owners (solo practice default)
UPDATE "users" SET "is_clinic_owner" = true WHERE "role" = 'DOCTOR';
