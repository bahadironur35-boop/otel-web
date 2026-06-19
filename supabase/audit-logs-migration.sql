CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "actorId" TEXT,
  "actorName" TEXT NOT NULL,
  "actorEmail" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLog_hotelId_createdAt_idx"
  ON "AuditLog"("hotelId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_hotelId_actorId_idx"
  ON "AuditLog"("hotelId", "actorId");
CREATE INDEX IF NOT EXISTS "AuditLog_hotelId_action_idx"
  ON "AuditLog"("hotelId", "action");
CREATE INDEX IF NOT EXISTS "AuditLog_hotelId_entityType_idx"
  ON "AuditLog"("hotelId", "entityType");

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
