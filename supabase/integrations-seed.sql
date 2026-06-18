INSERT INTO "ChannelCatalog"
  ("id", "code", "name", "market", "category", "defaultCurrency", "supportsInventory", "supportsRates", "supportsBookings", "active", "createdAt", "updatedAt")
VALUES
  ('catalog-booking', 'booking', 'Booking.com', 'Uluslararası', 'OTA', 'EUR', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-etstur', 'etstur', 'Etstur', 'Türkiye', 'Yerel OTA', 'TRY', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-expedia', 'expedia', 'Expedia', 'Uluslararası', 'OTA', 'USD', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-agoda', 'agoda', 'Agoda', 'Asya / Orta Doğu', 'OTA', 'USD', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-airbnb', 'airbnb', 'Airbnb', 'Uluslararası', 'Alternatif Konaklama', 'EUR', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-tatilsepeti', 'tatilsepeti', 'Tatilsepeti', 'Türkiye', 'Yerel OTA', 'TRY', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-otelz', 'otelz', 'Otelz', 'Türkiye', 'Yerel OTA', 'TRY', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalog-direct', 'direct-web', 'Doğrudan Web Sitesi', 'Doğrudan', 'Booking Engine', 'TRY', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "market" = EXCLUDED."market",
  "category" = EXCLUDED."category",
  "defaultCurrency" = EXCLUDED."defaultCurrency",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "IntegrationProvider"
  ("id", "hotelId", "type", "name", "status", "notes", "createdAt", "updatedAt")
SELECT
  provider.id,
  hotel.id,
  provider.type::"ProviderType",
  provider.name,
  'NOT_CONFIGURED'::"IntegrationStatus",
  provider.notes,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Hotel" hotel
CROSS JOIN (
  VALUES
    ('provider-channex', 'CHANNEX', 'Channex', 'Global aggregator, staging adapter hazır'),
    ('provider-hotelrunner', 'HOTELRUNNER', 'HotelRunner', 'Türkiye odaklı partnerlik başvurusu gerekli'),
    ('provider-siteminder', 'SITEMINDER', 'SiteMinder', 'Global kanal yöneticisi partnerliği gerekli'),
    ('provider-direct', 'DIRECT_OTA', 'Doğrudan OTA', 'Her OTA için ayrı sertifikasyon gerekir'),
    ('provider-manual', 'MANUAL_CSV', 'Manuel / CSV', 'API olmayan kanallar için geçiş yöntemi')
) AS provider(id, type, name, notes)
WHERE hotel.slug = 'stayos-demo'
ON CONFLICT ("hotelId", "type") DO UPDATE SET
  "name" = EXCLUDED."name",
  "notes" = EXCLUDED."notes",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "ChannelConnection"
  ("id", "hotelId", "providerId", "channelCatalogId", "enabled", "status", "errorMessage", "createdAt", "updatedAt")
SELECT
  'connection-' || catalog.code,
  hotel.id,
  CASE
    WHEN catalog.code = 'direct-web' THEN direct_provider.id
    ELSE manual_provider.id
  END,
  catalog.id,
  catalog.code = 'direct-web',
  CASE
    WHEN catalog.code = 'direct-web' THEN 'CONNECTED'::"IntegrationStatus"
    ELSE 'NOT_CONFIGURED'::"IntegrationStatus"
  END,
  CASE
    WHEN catalog.code = 'direct-web' THEN NULL
    ELSE 'Sağlayıcı seçimi ve ticari erişim bekleniyor'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Hotel" hotel
JOIN "ChannelCatalog" catalog ON catalog.active = true
JOIN "IntegrationProvider" direct_provider
  ON direct_provider."hotelId" = hotel.id AND direct_provider.type = 'DIRECT_OTA'
JOIN "IntegrationProvider" manual_provider
  ON manual_provider."hotelId" = hotel.id AND manual_provider.type = 'MANUAL_CSV'
WHERE hotel.slug = 'stayos-demo'
ON CONFLICT ("hotelId", "channelCatalogId") DO NOTHING;

INSERT INTO "ComplianceItem"
  ("id", "hotelId", "code", "title", "category", "status", "notes", "createdAt", "updatedAt")
SELECT
  item.id,
  hotel.id,
  item.code,
  item.title,
  item.category,
  item.status::"ComplianceStatus",
  item.notes,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Hotel" hotel
CROSS JOIN (
  VALUES
    ('compliance-kbs', 'kbs', 'KBS / Jandarma-Polis Kimlik Bildirimi', 'Yasal Bildirim', 'NOT_STARTED', 'Tesis türü ve konuma göre Emniyet veya Jandarma süreci'),
    ('compliance-kvkk', 'kvkk', 'KVKK ve Açık Rıza Metinleri', 'Veri Koruma', 'IN_PROGRESS', 'Misafir verisi saklama, aydınlatma ve silme süreçleri'),
    ('compliance-efatura', 'efatura', 'e-Fatura / e-Arşiv Entegrasyonu', 'Finans', 'NOT_STARTED', 'GİB uyumlu özel entegratör seçimi gerekli'),
    ('compliance-payment', 'payment-tr', 'Türkiye Ödeme Sağlayıcısı', 'Ödeme', 'NOT_STARTED', 'iyzico, PayTR veya banka sanal POS değerlendirmesi'),
    ('compliance-currency', 'multi-currency', 'TRY / EUR / USD Fiyat Planları', 'Gelir Yönetimi', 'IN_PROGRESS', 'Kur politikası ve kanal bazlı fiyatlandırma'),
    ('compliance-contracts', 'ota-contracts', 'OTA Ticari Sözleşmeleri', 'Dağıtım', 'NOT_STARTED', 'Her kanal için tesis üyeliği ve komisyon sözleşmesi'),
    ('compliance-security', 'security', 'Yetki, Loglama ve Güvenlik', 'Teknik', 'IN_PROGRESS', 'Rol bazlı erişim, denetim kaydı ve yedekleme')
) AS item(id, code, title, category, status, notes)
WHERE hotel.slug = 'stayos-demo'
ON CONFLICT ("hotelId", "code") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "notes" = EXCLUDED."notes",
  "updatedAt" = CURRENT_TIMESTAMP;
