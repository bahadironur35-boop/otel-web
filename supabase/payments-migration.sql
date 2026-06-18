DO $$ BEGIN
  CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'IYZICO', 'PAYTR', 'BANK_POS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'LINK_SENT', 'PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
  "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "paymentLink" TEXT,
  "externalTransaction" TEXT,
  "failureReason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Payment_reservationId_fkey"
    FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Payment_hotelId_status_idx"
  ON "Payment"("hotelId", "status");

CREATE INDEX IF NOT EXISTS "Payment_reservationId_createdAt_idx"
  ON "Payment"("reservationId", "createdAt");

ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
