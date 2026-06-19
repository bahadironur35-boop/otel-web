DO $$ BEGIN
  CREATE TYPE "GuestStatus" AS ENUM ('STANDARD', 'VIP', 'WATCHLIST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "StayStatus" AS ENUM ('RESERVED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PhysicalRoomStatus" AS ENUM ('READY', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Guest" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "nationality" TEXT,
  "identityNumber" TEXT,
  "passportNumber" TEXT,
  "status" "GuestStatus" NOT NULL DEFAULT 'STANDARD',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Guest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Guest_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Guest_hotelId_fullName_idx" ON "Guest"("hotelId", "fullName");
CREATE INDEX IF NOT EXISTS "Guest_hotelId_email_idx" ON "Guest"("hotelId", "email");

ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "guestId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Reservation"
    ADD CONSTRAINT "Reservation_guestId_fkey"
    FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PhysicalRoom" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "roomTypeId" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "floor" TEXT,
  "status" "PhysicalRoomStatus" NOT NULL DEFAULT 'READY',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PhysicalRoom_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PhysicalRoom_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PhysicalRoom_roomTypeId_fkey"
    FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PhysicalRoom_hotelId_number_key"
  ON "PhysicalRoom"("hotelId", "number");
CREATE INDEX IF NOT EXISTS "PhysicalRoom_roomTypeId_status_idx"
  ON "PhysicalRoom"("roomTypeId", "status");

CREATE TABLE IF NOT EXISTS "Stay" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "guestId" TEXT NOT NULL,
  "physicalRoomId" TEXT NOT NULL,
  "status" "StayStatus" NOT NULL DEFAULT 'RESERVED',
  "checkedInAt" TIMESTAMP(3),
  "checkedOutAt" TIMESTAMP(3),
  "expectedCheckIn" TIMESTAMP(3) NOT NULL,
  "expectedCheckOut" TIMESTAMP(3) NOT NULL,
  "adults" INTEGER NOT NULL DEFAULT 1,
  "children" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Stay_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Stay_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Stay_reservationId_fkey"
    FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Stay_guestId_fkey"
    FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Stay_physicalRoomId_fkey"
    FOREIGN KEY ("physicalRoomId") REFERENCES "PhysicalRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Stay_reservationId_key" ON "Stay"("reservationId");
CREATE INDEX IF NOT EXISTS "Stay_hotelId_status_idx" ON "Stay"("hotelId", "status");
CREATE INDEX IF NOT EXISTS "Stay_physicalRoomId_status_idx" ON "Stay"("physicalRoomId", "status");

ALTER TABLE "Guest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PhysicalRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stay" ENABLE ROW LEVEL SECURITY;
