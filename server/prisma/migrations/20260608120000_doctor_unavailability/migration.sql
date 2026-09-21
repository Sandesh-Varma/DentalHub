-- Calendar blocks: doctor marks dates/times they are NOT available
CREATE TABLE "doctor_unavailability" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,

    CONSTRAINT "doctor_unavailability_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "doctor_unavailability_doctor_id_date_idx" ON "doctor_unavailability"("doctor_id", "date");

ALTER TABLE "doctor_unavailability" ADD CONSTRAINT "doctor_unavailability_doctor_id_fkey"
  FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
