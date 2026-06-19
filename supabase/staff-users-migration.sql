DO $$ BEGIN
  CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING', 'ACCOUNTING');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "StaffUser" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "StaffRole" NOT NULL DEFAULT 'RECEPTION',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StaffUser_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "StaffUser_hotelId_email_key"
  ON "StaffUser"("hotelId", "email");
CREATE INDEX IF NOT EXISTS "StaffUser_hotelId_role_active_idx"
  ON "StaffUser"("hotelId", "role", "active");

ALTER TABLE "StaffUser" ENABLE ROW LEVEL SECURITY;
