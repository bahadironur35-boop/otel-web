import "server-only";

import { formatCurrency, formatDateRange } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

const categoryLabels = {
  ACCOMMODATION: "Konaklama",
  FOOD: "Yiyecek",
  BEVERAGE: "İçecek",
  MINIBAR: "Minibar",
  SPA: "Spa",
  LAUNDRY: "Çamaşırhane",
  TRANSPORT: "Transfer",
  OTHER: "Diğer"
} as const;

export const folioProducts = [
  { description: "Kahvaltı", category: "FOOD", unitPrice: 450 },
  { description: "Öğle yemeği", category: "FOOD", unitPrice: 650 },
  { description: "Akşam yemeği", category: "FOOD", unitPrice: 750 },
  { description: "Oda servisi", category: "FOOD", unitPrice: 250 },
  { description: "Su", category: "MINIBAR", unitPrice: 30 },
  { description: "Meşrubat", category: "MINIBAR", unitPrice: 75 },
  { description: "Türk kahvesi", category: "BEVERAGE", unitPrice: 80 },
  { description: "Espresso", category: "BEVERAGE", unitPrice: 90 },
  { description: "Spa kullanımı", category: "SPA", unitPrice: 800 },
  { description: "Masaj", category: "SPA", unitPrice: 1200 },
  { description: "Çamaşırhane", category: "LAUNDRY", unitPrice: 150 },
  { description: "Havaalanı transferi", category: "TRANSPORT", unitPrice: 600 }
] as const;

export async function getFolioWorkspace(selectedId?: string) {
  if (!hasDatabase) {
    return { schemaReady: false, folios: [], selectedFolio: null, products: folioProducts };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        folios: {
          where: { status: "OPEN" },
          include: {
            items: { orderBy: { postedAt: "desc" } },
            reservation: {
              include: {
                roomType: true,
                payments: { where: { status: "PAID" } },
                stay: {
                  include: {
                    physicalRoom: true,
                    guest: true
                  }
                }
              }
            }
          },
          orderBy: { updatedAt: "desc" }
        }
      }
    });

    if (!hotel) {
      return { schemaReady: true, folios: [], selectedFolio: null, products: folioProducts };
    }

    const folios = hotel.folios
      .filter((folio) => folio.reservation.stay?.status === "CHECKED_IN")
      .map((folio) => {
        const extrasTotal = folio.items.reduce((sum, item) => sum + item.amount, 0);
        const grandTotal = folio.reservation.totalAmount + extrasTotal;
        const paidTotal = folio.reservation.payments.reduce((sum, payment) => sum + payment.amount, 0);

        return {
          id: folio.id,
          reservationId: folio.reservationId,
          guestId: folio.reservation.stay?.guest.id ?? null,
          guestName: folio.reservation.stay?.guest.fullName ?? folio.reservation.guestName,
          roomNumber: folio.reservation.stay?.physicalRoom.number ?? "-",
          roomName: folio.reservation.roomType.name,
          dates: formatDateRange(folio.reservation.checkIn, folio.reservation.checkOut),
          accommodationTotal: folio.reservation.totalAmount,
          extrasTotal,
          grandTotal,
          paidTotal,
          balance: Math.max(grandTotal - paidTotal, 0),
          currency: folio.reservation.currency,
          items: folio.items.map((item) => ({
            id: item.id,
            description: item.description,
            category: item.category,
            categoryLabel: categoryLabels[item.category],
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            amountLabel: formatCurrency(item.amount, item.currency),
            postedAt: item.postedAt
          }))
        };
      });

    return {
      schemaReady: true,
      folios,
      selectedFolio: folios.find((folio) => folio.id === selectedId) ?? folios[0] ?? null,
      products: folioProducts
    };
  } catch (error) {
    console.error("Folio workspace read failed.", error);
    return { schemaReady: false, folios: [], selectedFolio: null, products: folioProducts };
  }
}
