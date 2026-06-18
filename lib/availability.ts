import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const activeStatuses = [
  ReservationStatus.NEW,
  ReservationStatus.CONFIRMED,
  ReservationStatus.PAYMENT_PENDING
];

export function parseStayDates(checkInValue: string, checkOutValue: string) {
  const checkIn = new Date(`${checkInValue}T12:00:00`);
  const checkOut = new Date(`${checkOutValue}T10:00:00`);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);

  return {
    checkIn,
    checkOut,
    nights,
    valid: Number.isFinite(nights) && nights >= 1
  };
}

export async function getRoomAvailability(roomTypeId: string, checkIn: Date, checkOut: Date) {
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId }
  });

  if (!roomType || roomType.inventory < 1) {
    return {
      available: false,
      remaining: 0,
      roomType
    };
  }

  const occupied = await prisma.reservation.count({
    where: {
      roomTypeId,
      status: {
        in: activeStatuses
      },
      checkIn: {
        lt: checkOut
      },
      checkOut: {
        gt: checkIn
      }
    }
  });

  const remaining = Math.max(roomType.inventory - occupied, 0);

  return {
    available: remaining > 0,
    remaining,
    roomType
  };
}
