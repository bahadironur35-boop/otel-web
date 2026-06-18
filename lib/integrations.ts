import "server-only";

import { getHotelData } from "@/lib/data";
import { hasDatabase, prisma } from "@/lib/prisma";

const providerLabels = {
  CHANNEX: "Channex",
  HOTELRUNNER: "HotelRunner",
  SITEMINDER: "SiteMinder",
  DIRECT_OTA: "Doğrudan OTA",
  MANUAL_CSV: "Manuel / CSV"
} as const;

const integrationStatusLabels = {
  NOT_CONFIGURED: "Yapılandırılmadı",
  CONNECTED: "Bağlı",
  DEGRADED: "Kısıtlı",
  DISCONNECTED: "Bağlantı yok"
} as const;

const complianceStatusLabels = {
  NOT_STARTED: "Başlanmadı",
  IN_PROGRESS: "Devam ediyor",
  READY: "Hazır",
  NOT_APPLICABLE: "Uygulanmıyor"
} as const;

type ProviderView = {
  id: string;
  type: string;
  name: string;
  status: string;
  statusLabel: string;
  externalAccountId: string | null;
  lastTestedAt: Date | null;
  notes: string | null;
};

type CatalogView = {
  id: string;
  code: string;
  name: string;
  market: string;
  category: string;
  currency: string | null;
};

type ComplianceView = {
  id: string;
  code: string;
  title: string;
  category: string;
  status: string;
  statusLabel: string;
  notes: string | null;
};

const fallbackProviders: ProviderView[] = Object.entries(providerLabels).map(([type, name]) => ({
  id: `fallback-${type.toLowerCase()}`,
  type,
  name,
  status: "NOT_CONFIGURED",
  statusLabel: "Yapılandırılmadı",
  externalAccountId: null,
  lastTestedAt: null,
  notes: null
}));

const fallbackCatalog: CatalogView[] = [
  ["booking", "Booking.com", "Uluslararası", "OTA", "EUR"],
  ["etstur", "Etstur", "Türkiye", "Yerel OTA", "TRY"],
  ["expedia", "Expedia", "Uluslararası", "OTA", "USD"],
  ["agoda", "Agoda", "Asya / Orta Doğu", "OTA", "USD"],
  ["airbnb", "Airbnb", "Uluslararası", "Alternatif Konaklama", "EUR"],
  ["tatilsepeti", "Tatilsepeti", "Türkiye", "Yerel OTA", "TRY"],
  ["otelz", "Otelz", "Türkiye", "Yerel OTA", "TRY"],
  ["direct-web", "Doğrudan Web Sitesi", "Doğrudan", "Booking Engine", "TRY"]
].map(([code, name, market, category, currency]) => ({
  id: `catalog-${code}`,
  code,
  name,
  market,
  category,
  currency
}));

const fallbackCompliance: ComplianceView[] = [
  ["kbs", "KBS / Jandarma-Polis Kimlik Bildirimi", "Yasal Bildirim"],
  ["kvkk", "KVKK ve Açık Rıza Metinleri", "Veri Koruma"],
  ["efatura", "e-Fatura / e-Arşiv Entegrasyonu", "Finans"],
  ["payment-tr", "Türkiye Ödeme Sağlayıcısı", "Ödeme"],
  ["multi-currency", "TRY / EUR / USD Fiyat Planları", "Gelir Yönetimi"],
  ["ota-contracts", "OTA Ticari Sözleşmeleri", "Dağıtım"],
  ["security", "Yetki, Loglama ve Güvenlik", "Teknik"]
].map(([code, title, category]) => ({
  id: `compliance-${code}`,
  code,
  title,
  category,
  status: "NOT_STARTED",
  statusLabel: "Başlanmadı",
  notes: null
}));

export async function getIntegrationWorkspace() {
  const { rooms } = await getHotelData();

  if (!hasDatabase) {
    return {
      schemaReady: false,
      providers: fallbackProviders,
      catalog: fallbackCatalog,
      connections: [],
      mappings: [],
      logs: [],
      compliance: fallbackCompliance,
      rooms
    };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        providers: {
          orderBy: { name: "asc" }
        },
        connections: {
          include: {
            provider: true,
            channelCatalog: true
          },
          orderBy: {
            channelCatalog: {
              name: "asc"
            }
          }
        },
        roomMappings: {
          include: {
            provider: true,
            roomType: true
          },
          orderBy: { createdAt: "desc" }
        },
        syncLogs: {
          include: {
            provider: true,
            channelConnection: {
              include: {
                channelCatalog: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 20
        },
        compliance: {
          orderBy: [{ category: "asc" }, { title: "asc" }]
        }
      }
    });

    const catalog = await prisma.channelCatalog.findMany({
      where: { active: true },
      orderBy: [{ market: "asc" }, { name: "asc" }]
    });

    if (!hotel) {
      throw new Error("Hotel not found.");
    }

    return {
      schemaReady: true,
      providers: hotel.providers.map((provider) => ({
        id: provider.id,
        type: provider.type,
        name: provider.name,
        status: provider.status,
        statusLabel: integrationStatusLabels[provider.status],
        externalAccountId: provider.externalAccountId,
        lastTestedAt: provider.lastTestedAt,
        notes: provider.notes
      })),
      catalog: catalog.map((channel) => ({
        id: channel.id,
        code: channel.code,
        name: channel.name,
        market: channel.market,
        category: channel.category,
        currency: channel.defaultCurrency
      })),
      connections: hotel.connections.map((connection) => ({
        id: connection.id,
        catalogId: connection.channelCatalogId,
        channelName: connection.channelCatalog.name,
        channelCode: connection.channelCatalog.code,
        providerId: connection.providerId,
        providerName: connection.provider.name,
        externalChannelId: connection.externalChannelId,
        enabled: connection.enabled,
        status: connection.status,
        statusLabel: integrationStatusLabels[connection.status],
        lastSyncedAt: connection.lastSyncedAt,
        errorMessage: connection.errorMessage
      })),
      mappings: hotel.roomMappings.map((mapping) => ({
        id: mapping.id,
        providerId: mapping.providerId,
        providerName: mapping.provider.name,
        roomTypeId: mapping.roomTypeId,
        roomName: mapping.roomType.name,
        externalRoomTypeId: mapping.externalRoomTypeId,
        externalRatePlanId: mapping.externalRatePlanId,
        active: mapping.active
      })),
      logs: hotel.syncLogs.map((log) => ({
        id: log.id,
        providerName: log.provider?.name ?? "Sistem",
        channelName: log.channelConnection?.channelCatalog.name ?? "Genel",
        direction: log.direction,
        resource: log.resource,
        state: log.state,
        recordsCount: log.recordsCount,
        message: log.message,
        createdAt: log.createdAt
      })),
      compliance: hotel.compliance.map((item) => ({
        id: item.id,
        code: item.code,
        title: item.title,
        category: item.category,
        status: item.status,
        statusLabel: complianceStatusLabels[item.status],
        notes: item.notes
      })),
      rooms
    };
  } catch (error) {
    console.error("Integration workspace read failed.", error);
    return {
      schemaReady: false,
      providers: fallbackProviders,
      catalog: fallbackCatalog,
      connections: [],
      mappings: [],
      logs: [],
      compliance: fallbackCompliance,
      rooms
    };
  }
}
