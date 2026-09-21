ALTER TABLE "users" ADD COLUMN "google_id" TEXT;

CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
