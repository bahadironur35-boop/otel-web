import "server-only";

import { formatCurrency, formatDateRange } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

export async function getCheckoutWorkspace(selectedStayId?: string) {
  if (!hasDatabase) {
    return { schemaReady: false, stays: [], selectedStay: null };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        stays: {
          where: { status: "CHECKED_IN" },
          include: {
            guest: true,
            physicalRoom: true,
            reservation: {
              include: {
                roomType: true,
                payments: { where: { status: "PAID" } },
                folio: {
                  include: {
                    items: { orderBy: { postedAt: "desc" } }
                  }
                }
              }
            }
          },
          orderBy: { expectedCheckOut: "asc" }
        }
      }
    });

    if (!hotel) {
      return { schemaReady: true, stays: [], selectedStay: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stays = hotel.stays.map((stay) => {
      const extrasTotal =
        stay.reservation.folio?.items.reduce((sum, item) => sum + item.amount, 0) ?? 0;
      const grandTotal = stay.reservation.totalAmount + extrasTotal;
      const paidTotal = stay.reservation.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const expectedDate = new Date(stay.expectedCheckOut);
      expectedDate.setHours(0, 0, 0, 0);
      const dayDifference = Math.round(
        (expectedDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        id: stay.id,
        folioId: stay.reservation.folio?.id ?? null,
        guestId: stay.guestId,
        guestName: stay.guest.fullName,
        roomNumber: stay.physicalRoom.number,
        roomName: stay.reservation.roomType.name,
        dates: formatDateRange(stay.expectedCheckIn, stay.expectedCheckOut),
        departureLabel:
          dayDifference < 0
            ? `${Math.abs(dayDifference)} gün gecikmiş`
            : dayDifference === 0
              ? "Bugün çıkıyor"
              : dayDifference === 1
                ? "Yarın çıkıyor"
                : `${dayDifference} gün sonra`,
        accommodationTotal: stay.reservation.totalAmount,
        extrasTotal,
        grandTotal,
        paidTotal,
        balance: Math.max(grandTotal - paidTotal, 0),
        currency: stay.reservation.currency,
        balanceLabel: formatCurrency(Math.max(grandTotal - paidTotal, 0), stay.reservation.currency),
        items:
          stay.reservation.folio?.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            amount: item.amount,
            amountLabel: formatCurrency(item.amount, item.currency)
          })) ?? []
      };
    });

    return {
      schemaReady: true,
      stays,
      selectedStay: stays.find((stay) => stay.id === selectedStayId) ?? stays[0] ?? null
    };
  } catch (error) {
    console.error("Checkout workspace read failed.", error);
    return { schemaReady: false, stays: [], selectedStay: null };
  }
}
