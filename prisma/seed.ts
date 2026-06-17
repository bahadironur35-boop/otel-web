import { PrismaClient, ChannelStatus, ReservationStatus, RoomStatus, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hotel = await prisma.hotel.upsert({
    where: { slug: "stayos-demo" },
    update: {},
    create: {
      name: "StayOS Demo Hotel",
      slug: "stayos-demo",
      city: "Muğla",
      country: "Türkiye"
    }
  });

  const denizSuite = await prisma.roomType.upsert({
    where: { id: "seed-deniz-suite" },
    update: {},
    create: {
      id: "seed-deniz-suite",
      hotelId: hotel.id,
      name: "Deniz Suite",
      capacity: "2 yetişkin",
      nightlyRate: 6900,
      inventory: 8,
      status: RoomStatus.READY
    }
  });

  const aileOdasi = await prisma.roomType.upsert({
    where: { id: "seed-aile-odasi" },
    update: {},
    create: {
      id: "seed-aile-odasi",
      hotelId: hotel.id,
      name: "Aile Odası",
      capacity: "2 yetişkin, 1 çocuk",
      nightlyRate: 5400,
      inventory: 12,
      status: RoomStatus.EXTRA_BED
    }
  });

  await prisma.roomType.upsert({
    where: { id: "seed-bahce-deluxe" },
    update: {},
    create: {
      id: "seed-bahce-deluxe",
      hotelId: hotel.id,
      name: "Bahçe Deluxe",
      capacity: "2 yetişkin",
      nightlyRate: 4850,
      inventory: 18,
      status: RoomStatus.CLEANING
    }
  });

  await prisma.reservation.upsert({
    where: { id: "seed-res-ayse" },
    update: {},
    create: {
      id: "seed-res-ayse",
      hotelId: hotel.id,
      roomTypeId: denizSuite.id,
      guestName: "Ayşe Demir",
      guestEmail: "ayse@example.com",
      checkIn: new Date("2026-07-12T12:00:00.000Z"),
      checkOut: new Date("2026-07-16T10:00:00.000Z"),
      guests: 2,
      channel: "Web sitesi",
      status: ReservationStatus.CONFIRMED,
      totalAmount: 27600
    }
  });

  await prisma.reservation.upsert({
    where: { id: "seed-res-mert" },
    update: {},
    create: {
      id: "seed-res-mert",
      hotelId: hotel.id,
      roomTypeId: aileOdasi.id,
      guestName: "Mert Kaya",
      guestEmail: "mert@example.com",
      checkIn: new Date("2026-07-18T12:00:00.000Z"),
      checkOut: new Date("2026-07-21T10:00:00.000Z"),
      guests: 3,
      channel: "Booking",
      status: ReservationStatus.PAYMENT_PENDING,
      totalAmount: 16200
    }
  });

  await prisma.task.createMany({
    data: [
      {
        hotelId: hotel.id,
        title: "203 numara bakım kontrolü",
        owner: "Teknik ekip",
        dueAt: new Date("2026-07-12T10:30:00.000Z"),
        priority: TaskPriority.HIGH
      },
      {
        hotelId: hotel.id,
        title: "Deniz Suite check-in hazırlığı",
        owner: "Housekeeping",
        dueAt: new Date("2026-07-12T11:00:00.000Z"),
        priority: TaskPriority.MEDIUM
      }
    ],
    skipDuplicates: true
  });

  await prisma.channel.createMany({
    data: [
      {
        hotelId: hotel.id,
        name: "Booking",
        status: ChannelStatus.SYNCED,
        inventory: 42,
        alert: "Aile Odası fiyat planı kontrol edilmeli"
      },
      {
        hotelId: hotel.id,
        name: "Expedia",
        status: ChannelStatus.SYNCED,
        inventory: 39,
        alert: "Sorun yok"
      },
      {
        hotelId: hotel.id,
        name: "Airbnb",
        status: ChannelStatus.DELAYED,
        inventory: 12,
        alert: "Stok güncellemesi 18 dakika gecikti"
      }
    ],
    skipDuplicates: true
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
