INSERT INTO "PhysicalRoom"
  ("id", "hotelId", "roomTypeId", "number", "floor", "status", "createdAt", "updatedAt")
SELECT data.id, hotel.id, data.room_type_id, data.number, data.floor, 'READY'::"PhysicalRoomStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Hotel" hotel
CROSS JOIN (
  VALUES
    ('room-101', 'seed-bahce-deluxe', '101', '1'),
    ('room-102', 'seed-bahce-deluxe', '102', '1'),
    ('room-201', 'seed-deniz-suite', '201', '2'),
    ('room-202', 'seed-deniz-suite', '202', '2'),
    ('room-301', 'seed-aile-odasi', '301', '3'),
    ('room-302', 'seed-aile-odasi', '302', '3')
) AS data(id, room_type_id, number, floor)
WHERE hotel.slug = 'stayos-demo'
  AND EXISTS (SELECT 1 FROM "RoomType" rt WHERE rt.id = data.room_type_id)
ON CONFLICT ("hotelId", "number") DO NOTHING;

INSERT INTO "Guest"
  ("id", "hotelId", "fullName", "email", "status", "createdAt", "updatedAt")
SELECT
  'guest-' || reservation.id,
  reservation."hotelId",
  reservation."guestName",
  reservation."guestEmail",
  'STANDARD'::"GuestStatus",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Reservation" reservation
WHERE reservation."guestId" IS NULL
ON CONFLICT ("id") DO NOTHING;

UPDATE "Reservation" reservation
SET "guestId" = 'guest-' || reservation.id
WHERE reservation."guestId" IS NULL
  AND EXISTS (SELECT 1 FROM "Guest" guest WHERE guest.id = 'guest-' || reservation.id);
