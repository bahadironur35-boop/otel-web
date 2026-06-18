import "server-only";

import { ReservationStatus } from "@prisma/client";
import { getChannexRoomMapping, pushChannexAvailability } from "@/lib/channex";
import { prisma } from "@/lib/prisma";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function syncInventoryToChannex(days = 30) {
  const roomMapping = getChannexRoomMapping();
  const hotel = await prisma.hotel.findUnique({
    where: { slug: "stayos-demo" },
    include: { rooms: true }
  });

  if (!hotel) {
    throw new Error("StayOS demo hotel was not found.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  const reservations = await prisma.reservation.findMany({
    where: {
      hotelId: hotel.id,
      status: {
        in: [
          ReservationStatus.NEW,
          ReservationStatus.CONFIRMED,
          ReservationStatus.PAYMENT_PENDING
        ]
      },
      checkIn: { lt: endDate },
      checkOut: { gt: today }
    },
    select: {
      roomTypeId: true,
      checkIn: true,
      checkOut: true
    }
  });

  const values: Array<{ roomTypeId: string; date: string; availability: number }> = [];

  for (const room of hotel.rooms) {
    const channexRoomTypeId = roomMapping[room.id];

    if (!channexRoomTypeId) {
      continue;
    }

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const occupied = reservations.filter(
        (reservation) =>
          reservation.roomTypeId === room.id &&
          reservation.checkIn < nextDate &&
          reservation.checkOut > date
      ).length;

      values.push({
        roomTypeId: channexRoomTypeId,
        date: toDateKey(date),
        availability: Math.max(room.inventory - occupied, 0)
      });
    }
  }

  if (!values.length) {
    throw new Error("No Channex room mappings were found.");
  }

  await pushChannexAvailability(values);

  return {
    roomTypes: new Set(values.map((value) => value.roomTypeId)).size,
    values: values.length
  };
}
