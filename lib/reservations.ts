import { ReservationStatus } from "@prisma/client";
import { formatCurrency, formatDateRange } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

const statusLabels = {
  NEW: "Yeni",
  CONFIRMED: "Onaylandı",
  PAYMENT_PENDING: "Ödeme bekliyor",
  CANCELLED: "İptal edildi"
} as const;

export async function getReservationById(id: string) {
  if (!hasDatabase || id.startsWith("demo-")) {
    return null;
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      hotel: true,
      roomType: true
    }
  });

  if (!reservation) {
    return null;
  }

  return {
    id: reservation.id,
    guestName: reservation.guestName,
    guestEmail: reservation.guestEmail,
    phone: reservation.notes?.startsWith("Telefon: ")
      ? reservation.notes.replace("Telefon: ", "")
      : null,
    notes: reservation.notes,
    hotelName: reservation.hotel.name,
    roomName: reservation.roomType.name,
    dates: formatDateRange(reservation.checkIn, reservation.checkOut),
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    channel: reservation.channel,
    status: statusLabels[reservation.status],
    statusKey: reservation.status,
    amount: formatCurrency(reservation.totalAmount, reservation.currency),
    createdAt: reservation.createdAt
  };
}

export function isReservationStatus(value: string): value is ReservationStatus {
  return Object.values(ReservationStatus).includes(value as ReservationStatus);
}
