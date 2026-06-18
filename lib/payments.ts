import "server-only";

import { formatCurrency } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

const providerLabels = {
  MANUAL: "Manuel",
  IYZICO: "iyzico",
  PAYTR: "PayTR",
  BANK_POS: "Banka POS"
} as const;

const statusLabels = {
  CREATED: "Oluşturuldu",
  LINK_SENT: "Bağlantı gönderildi",
  PENDING: "Ödeme bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  EXPIRED: "Süresi doldu",
  REFUNDED: "İade edildi",
  CANCELLED: "İptal edildi"
} as const;

export async function getPaymentWorkspace() {
  if (!hasDatabase) {
    return {
      schemaReady: false,
      payments: [],
      reservations: []
    };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        reservations: {
          include: {
            roomType: true,
            payments: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          },
          orderBy: { createdAt: "desc" },
          take: 50
        },
        payments: {
          include: {
            reservation: {
              include: { roomType: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 100
        }
      }
    });

    if (!hotel) {
      throw new Error("Hotel not found.");
    }

    return {
      schemaReady: true,
      reservations: hotel.reservations.map((reservation) => ({
        id: reservation.id,
        guestName: reservation.guestName,
        roomName: reservation.roomType.name,
        amount: reservation.totalAmount,
        amountLabel: formatCurrency(reservation.totalAmount, reservation.currency),
        currency: reservation.currency,
        latestPaymentStatus: reservation.payments[0]?.status ?? null
      })),
      payments: hotel.payments.map((payment) => ({
        id: payment.id,
        reservationId: payment.reservationId,
        guestName: payment.reservation.guestName,
        roomName: payment.reservation.roomType.name,
        provider: payment.provider,
        providerLabel: providerLabels[payment.provider],
        status: payment.status,
        statusLabel: statusLabels[payment.status],
        amount: payment.amount,
        amountLabel: formatCurrency(payment.amount, payment.currency),
        currency: payment.currency,
        paymentLink: payment.paymentLink,
        externalTransaction: payment.externalTransaction,
        failureReason: payment.failureReason,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt
      }))
    };
  } catch (error) {
    console.error("Payment workspace read failed.", error);
    return {
      schemaReady: false,
      payments: [],
      reservations: []
    };
  }
}
