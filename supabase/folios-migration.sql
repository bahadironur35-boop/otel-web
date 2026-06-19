DO $$ BEGIN
  CREATE TYPE "FolioStatus" AS ENUM ('OPEN', 'CLOSED', 'VOID');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "FolioItemCategory" AS ENUM (
    'ACCOMMODATION',
    'FOOD',
    'BEVERAGE',
    'MINIBAR',
    'SPA',
    'LAUNDRY',
    'TRANSPORT',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Folio" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "status" "FolioStatus" NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Folio_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Folio_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Folio_reservationId_fkey"
    FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Folio_reservationId_key" ON "Folio"("reservationId");
CREATE INDEX IF NOT EXISTS "Folio_hotelId_status_idx" ON "Folio"("hotelId", "status");

CREATE TABLE IF NOT EXISTS "FolioItem" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "folioId" TEXT NOT NULL,
  "category" "FolioItemCategory" NOT NULL DEFAULT 'OTHER',
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FolioItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FolioItem_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FolioItem_folioId_fkey"
    FOREIGN KEY ("folioId") REFERENCES "Folio"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "FolioItem_folioId_postedAt_idx" ON "FolioItem"("folioId", "postedAt");
CREATE INDEX IF NOT EXISTS "FolioItem_hotelId_category_idx" ON "FolioItem"("hotelId", "category");

INSERT INTO "Folio" ("id", "hotelId", "reservationId", "status", "createdAt", "updatedAt")
SELECT
  'folio-' || reservation.id,
  reservation."hotelId",
  reservation.id,
  'OPEN'::"FolioStatus",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Reservation" reservation
WHERE EXISTS (
  SELECT 1 FROM "Stay" stay
  WHERE stay."reservationId" = reservation.id
)
ON CONFLICT ("reservationId") DO NOTHING;

ALTER TABLE "Folio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FolioItem" ENABLE ROW LEVEL SECURITY;
