DO $$ BEGIN
  CREATE TYPE "ProviderType" AS ENUM ('CHANNEX', 'HOTELRUNNER', 'SITEMINDER', 'DIRECT_OTA', 'MANUAL_CSV');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IntegrationStatus" AS ENUM ('NOT_CONFIGURED', 'CONNECTED', 'DEGRADED', 'DISCONNECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SyncDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'BIDIRECTIONAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SyncState" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ComplianceStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY', 'NOT_APPLICABLE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "IntegrationProvider" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "type" "ProviderType" NOT NULL,
  "name" TEXT NOT NULL,
  "status" "IntegrationStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "externalAccountId" TEXT,
  "lastTestedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntegrationProvider_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IntegrationProvider_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationProvider_hotelId_type_key"
  ON "IntegrationProvider"("hotelId", "type");

CREATE TABLE IF NOT EXISTS "ChannelCatalog" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "market" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "defaultCurrency" TEXT,
  "supportsInventory" BOOLEAN NOT NULL DEFAULT true,
  "supportsRates" BOOLEAN NOT NULL DEFAULT true,
  "supportsBookings" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChannelCatalog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChannelCatalog_code_key"
  ON "ChannelCatalog"("code");

CREATE TABLE IF NOT EXISTS "ChannelConnection" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "channelCatalogId" TEXT NOT NULL,
  "externalChannelId" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "status" "IntegrationStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "lastSyncedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChannelConnection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChannelConnection_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChannelConnection_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChannelConnection_channelCatalogId_fkey"
    FOREIGN KEY ("channelCatalogId") REFERENCES "ChannelCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChannelConnection_hotelId_channelCatalogId_key"
  ON "ChannelConnection"("hotelId", "channelCatalogId");

CREATE TABLE IF NOT EXISTS "RoomMapping" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "roomTypeId" TEXT NOT NULL,
  "externalRoomTypeId" TEXT NOT NULL,
  "externalRatePlanId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoomMapping_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RoomMapping_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RoomMapping_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RoomMapping_roomTypeId_fkey"
    FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "RoomMapping_providerId_roomTypeId_key"
  ON "RoomMapping"("providerId", "roomTypeId");

CREATE TABLE IF NOT EXISTS "SyncLog" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "providerId" TEXT,
  "channelConnectionId" TEXT,
  "direction" "SyncDirection" NOT NULL,
  "resource" TEXT NOT NULL,
  "state" "SyncState" NOT NULL,
  "recordsCount" INTEGER NOT NULL DEFAULT 0,
  "message" TEXT NOT NULL,
  "externalReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SyncLog_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SyncLog_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SyncLog_channelConnectionId_fkey"
    FOREIGN KEY ("channelConnectionId") REFERENCES "ChannelConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SyncLog_hotelId_createdAt_idx"
  ON "SyncLog"("hotelId", "createdAt");

CREATE TABLE IF NOT EXISTS "ComplianceItem" (
  "id" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" "ComplianceStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "notes" TEXT,
  "dueDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ComplianceItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ComplianceItem_hotelId_fkey"
    FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ComplianceItem_hotelId_code_key"
  ON "ComplianceItem"("hotelId", "code");

ALTER TABLE "IntegrationProvider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChannelCatalog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChannelConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoomMapping" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceItem" ENABLE ROW LEVEL SECURITY;
