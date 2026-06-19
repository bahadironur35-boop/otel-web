import "server-only";

import { formatCurrency, formatDateRange } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

const guestStatusLabels = {
  STANDARD: "Standart",
  VIP: "VIP",
  WATCHLIST: "Takip listesi"
} as const;

const stayStatusLabels = {
  RESERVED: "Giriş bekliyor",
  CHECKED_IN: "Konaklıyor",
  CHECKED_OUT: "Çıkış yaptı",
  NO_SHOW: "Gelmedi",
  CANCELLED: "İptal"
} as const;

export async function getGuestsWorkspace() {
  if (!hasDatabase) {
    return { schemaReady: false, guests: [], eligibleReservations: [], rooms: [] };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        guests: {
          include: {
            stays: {
              include: { physicalRoom: true, reservation: true },
              orderBy: { createdAt: "desc" },
              take: 1
            },
            reservations: {
              orderBy: { createdAt: "desc" }
            }
          },
          orderBy: { updatedAt: "desc" }
        },
        reservations: {
          where: {
            status: { in: ["CONFIRMED", "PAYMENT_PENDING"] },
            stay: null
          },
          include: { roomType: true },
          orderBy: { checkIn: "asc" }
        },
        physicalRooms: {
          where: { status: "READY" },
          include: { roomType: true },
          orderBy: { number: "asc" }
        }
      }
    });

    if (!hotel) throw new Error("Hotel not found.");

    return {
      schemaReady: true,
      guests: hotel.guests.map((guest) => {
        const latestStay = guest.stays[0];
        return {
          id: guest.id,
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          nationality: guest.nationality,
          identityNumber: guest.identityNumber,
          passportNumber: guest.passportNumber,
          status: guest.status,
          statusLabel: guestStatusLabels[guest.status],
          notes: guest.notes,
          reservationCount: guest.reservations.length,
          stayStatus: latestStay ? stayStatusLabels[latestStay.status] : "Konaklama yok",
          roomNumber: latestStay?.physicalRoom.number ?? null
        };
      }),
      eligibleReservations: hotel.reservations.map((reservation) => ({
        id: reservation.id,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        roomTypeId: reservation.roomTypeId,
        roomName: reservation.roomType.name,
        dates: formatDateRange(reservation.checkIn, reservation.checkOut),
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        amountLabel: formatCurrency(reservation.totalAmount, reservation.currency)
      })),
      rooms: hotel.physicalRooms.map((room) => ({
        id: room.id,
        number: room.number,
        floor: room.floor,
        roomTypeId: room.roomTypeId,
        roomName: room.roomType.name
      }))
    };
  } catch (error) {
    console.error("Guests workspace read failed.", error);
    return { schemaReady: false, guests: [], eligibleReservations: [], rooms: [] };
  }
}

export async function getGuestById(id: string) {
  if (!hasDatabase) return null;

  return prisma.guest.findUnique({
    where: { id },
    include: {
      reservations: {
        include: { roomType: true },
        orderBy: { createdAt: "desc" }
      },
      stays: {
        include: { reservation: true, physicalRoom: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });
}
