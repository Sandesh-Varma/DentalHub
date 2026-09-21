-- Solo-clinic roles: doctor, receptionist, patient (was dentist, admin, patient)
ALTER TYPE "Role" RENAME VALUE 'DENTIST' TO 'DOCTOR';
ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'RECEPTIONIST';
