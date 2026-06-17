INSERT INTO "Hotel" ("id", "name", "slug", "city", "country", "createdAt", "updatedAt")
VALUES ('seed-hotel', 'StayOS Demo Hotel', 'stayos-demo', 'Muğla', 'Türkiye', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "city" = EXCLUDED."city",
  "country" = EXCLUDED."country",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "RoomType" ("id", "hotelId", "name", "capacity", "nightlyRate", "currency", "status", "inventory", "createdAt", "updatedAt")
VALUES
  ('seed-deniz-suite', 'seed-hotel', 'Deniz Suite', '2 yetişkin', 6900, 'TRY', 'READY', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-aile-odasi', 'seed-hotel', 'Aile Odası', '2 yetişkin, 1 çocuk', 5400, 'TRY', 'EXTRA_BED', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-bahce-deluxe', 'seed-hotel', 'Bahçe Deluxe', '2 yetişkin', 4850, 'TRY', 'CLEANING', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "capacity" = EXCLUDED."capacity",
  "nightlyRate" = EXCLUDED."nightlyRate",
  "status" = EXCLUDED."status",
  "inventory" = EXCLUDED."inventory",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Reservation" ("id", "hotelId", "roomTypeId", "guestName", "guestEmail", "checkIn", "checkOut", "guests", "channel", "status", "totalAmount", "currency", "createdAt", "updatedAt")
VALUES
  ('seed-res-ayse', 'seed-hotel', 'seed-deniz-suite', 'Ayşe Demir', 'ayse@example.com', '2026-07-12 12:00:00', '2026-07-16 10:00:00', 2, 'Web sitesi', 'CONFIRMED', 27600, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-res-mert', 'seed-hotel', 'seed-aile-odasi', 'Mert Kaya', 'mert@example.com', '2026-07-18 12:00:00', '2026-07-21 10:00:00', 3, 'Booking', 'PAYMENT_PENDING', 16200, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "guestName" = EXCLUDED."guestName",
  "guestEmail" = EXCLUDED."guestEmail",
  "checkIn" = EXCLUDED."checkIn",
  "checkOut" = EXCLUDED."checkOut",
  "guests" = EXCLUDED."guests",
  "channel" = EXCLUDED."channel",
  "status" = EXCLUDED."status",
  "totalAmount" = EXCLUDED."totalAmount",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Task" ("id", "hotelId", "title", "owner", "dueAt", "priority", "done", "createdAt", "updatedAt")
VALUES
  ('seed-task-maintenance', 'seed-hotel', '203 numara bakım kontrolü', 'Teknik ekip', '2026-07-12 10:30:00', 'HIGH', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-task-checkin', 'seed-hotel', 'Deniz Suite check-in hazırlığı', 'Housekeeping', '2026-07-12 11:00:00', 'MEDIUM', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "owner" = EXCLUDED."owner",
  "dueAt" = EXCLUDED."dueAt",
  "priority" = EXCLUDED."priority",
  "done" = EXCLUDED."done",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Channel" ("id", "hotelId", "name", "status", "inventory", "alert", "createdAt", "updatedAt")
VALUES
  ('seed-channel-booking', 'seed-hotel', 'Booking', 'SYNCED', 42, 'Aile Odası fiyat planı kontrol edilmeli', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-channel-expedia', 'seed-hotel', 'Expedia', 'SYNCED', 39, 'Sorun yok', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-channel-airbnb', 'seed-hotel', 'Airbnb', 'DELAYED', 12, 'Stok güncellemesi 18 dakika gecikti', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("hotelId", "name") DO UPDATE SET
  "status" = EXCLUDED."status",
  "inventory" = EXCLUDED."inventory",
  "alert" = EXCLUDED."alert",
  "updatedAt" = CURRENT_TIMESTAMP;
