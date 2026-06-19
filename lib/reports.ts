import "server-only";

import { ReservationStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

const activeStatuses = [
  ReservationStatus.NEW,
  ReservationStatus.CONFIRMED,
  ReservationStatus.PAYMENT_PENDING
];

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function parseRange(from?: string, to?: string) {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), 0, 1);
  const defaultTo = new Date(now.getFullYear(), 11, 31);
  const parsedFrom = from ? new Date(`${from}T00:00:00`) : defaultFrom;
  const parsedTo = to ? new Date(`${to}T23:59:59`) : defaultTo;
  const valid = !Number.isNaN(parsedFrom.getTime()) && !Number.isNaN(parsedTo.getTime());

  return {
    from: startOfDay(valid ? parsedFrom : defaultFrom),
    to: endOfDay(valid ? parsedTo : defaultTo)
  };
}

function dateInputValue(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0")
  ].join("-");
}

function daysBetween(from: Date, to: Date) {
  return Math.max(Math.ceil((to.getTime() - from.getTime()) / 86_400_000), 1);
}

function stayNights(checkIn: Date, checkOut: Date, rangeFrom: Date, rangeTo: Date) {
  const effectiveStart = new Date(Math.max(checkIn.getTime(), rangeFrom.getTime()));
  const effectiveEnd = new Date(Math.min(checkOut.getTime(), rangeTo.getTime()));
  return effectiveEnd > effectiveStart ? daysBetween(effectiveStart, effectiveEnd) : 0;
}

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export async function getReportsWorkspace(fromValue?: string, toValue?: string) {
  const range = parseRange(fromValue, toValue);
  const empty = {
    schemaReady: false,
    range: { from: dateInputValue(range.from), to: dateInputValue(range.to) },
    metrics: {
      revenue: formatCurrency(0),
      collected: formatCurrency(0),
      occupancy: 0,
      adr: formatCurrency(0),
      revPar: formatCurrency(0),
      reservations: 0
    },
    monthly: [],
    channels: [],
    roomTypes: [],
    payments: []
  };

  if (!hasDatabase) return empty;

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        rooms: true,
        reservations: {
          where: {
            status: { in: activeStatuses },
            checkIn: { lte: range.to },
            checkOut: { gte: range.from }
          },
          include: {
            roomType: true,
            folio: { include: { items: true } }
          },
          orderBy: { checkIn: "asc" }
        },
        payments: {
          where: {
            status: "PAID",
            paidAt: { gte: range.from, lte: range.to }
          }
        }
      }
    });

    if (!hotel) return { ...empty, schemaReady: true };

    const totalInventory = hotel.rooms.reduce((sum, room) => sum + room.inventory, 0);
    const rangeDays = daysBetween(range.from, range.to);
    const availableRoomNights = totalInventory * rangeDays;
    const roomNights = hotel.reservations.reduce(
      (sum, reservation) => sum + stayNights(reservation.checkIn, reservation.checkOut, range.from, range.to),
      0
    );
    const revenue = hotel.reservations.reduce((sum, reservation) => {
      const extras = reservation.folio?.items.reduce((itemSum, item) => itemSum + item.amount, 0) ?? 0;
      return sum + reservation.totalAmount + extras;
    }, 0);
    const collected = hotel.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const adr = roomNights > 0 ? Math.round(revenue / roomNights) : 0;
    const revPar = availableRoomNights > 0 ? Math.round(revenue / availableRoomNights) : 0;

    const monthFormatter = new Intl.DateTimeFormat("tr-TR", { month: "short" });
    const monthlyMap = new Map<string, { label: string; revenue: number; reservations: number }>();
    const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1);
    const finalMonth = new Date(range.to.getFullYear(), range.to.getMonth(), 1);

    while (cursor <= finalMonth && monthlyMap.size < 18) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      monthlyMap.set(key, {
        label: `${monthFormatter.format(cursor)} ${String(cursor.getFullYear()).slice(-2)}`,
        revenue: 0,
        reservations: 0
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const channelMap = new Map<string, { reservations: number; revenue: number }>();
    const roomTypeMap = new Map<string, { roomNights: number; revenue: number; reservations: number }>();

    for (const reservation of hotel.reservations) {
      const extras = reservation.folio?.items.reduce((sum, item) => sum + item.amount, 0) ?? 0;
      const total = reservation.totalAmount + extras;
      const monthKey = `${reservation.checkIn.getFullYear()}-${reservation.checkIn.getMonth()}`;
      const month = monthlyMap.get(monthKey);
      if (month) {
        month.revenue += total;
        month.reservations += 1;
      }

      const channel = channelMap.get(reservation.channel) ?? { reservations: 0, revenue: 0 };
      channel.reservations += 1;
      channel.revenue += total;
      channelMap.set(reservation.channel, channel);

      const roomType = roomTypeMap.get(reservation.roomType.name) ?? {
        roomNights: 0,
        revenue: 0,
        reservations: 0
      };
      roomType.roomNights += stayNights(reservation.checkIn, reservation.checkOut, range.from, range.to);
      roomType.revenue += total;
      roomType.reservations += 1;
      roomTypeMap.set(reservation.roomType.name, roomType);
    }

    const monthly = [...monthlyMap.values()];
    const maximumMonthlyRevenue = Math.max(...monthly.map((item) => item.revenue), 1);
    const channels = [...channelMap.entries()]
      .map(([name, value]) => ({
        name,
        ...value,
        share: percentage(value.revenue, revenue),
        revenueLabel: formatCurrency(value.revenue)
      }))
      .sort((a, b) => b.revenue - a.revenue);
    const roomTypes = [...roomTypeMap.entries()]
      .map(([name, value]) => ({
        name,
        ...value,
        adr: value.roomNights > 0 ? Math.round(value.revenue / value.roomNights) : 0,
        revenueLabel: formatCurrency(value.revenue)
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const providerLabels = {
      MANUAL: "Nakit / Manuel",
      IYZICO: "iyzico",
      PAYTR: "PayTR",
      BANK_POS: "Banka POS"
    } as const;
    const paymentMap = new Map<string, number>();
    for (const payment of hotel.payments) {
      paymentMap.set(payment.provider, (paymentMap.get(payment.provider) ?? 0) + payment.amount);
    }

    return {
      schemaReady: true,
      range: { from: dateInputValue(range.from), to: dateInputValue(range.to) },
      metrics: {
        revenue: formatCurrency(revenue),
        collected: formatCurrency(collected),
        occupancy: percentage(roomNights, availableRoomNights),
        adr: formatCurrency(adr),
        revPar: formatCurrency(revPar),
        reservations: hotel.reservations.length
      },
      monthly: monthly.map((item) => ({
        ...item,
        revenueLabel: formatCurrency(item.revenue),
        height: Math.max(Math.round((item.revenue / maximumMonthlyRevenue) * 100), item.revenue > 0 ? 8 : 2)
      })),
      channels,
      roomTypes,
      payments: [...paymentMap.entries()]
        .map(([provider, amount]) => ({
          provider,
          label: providerLabels[provider as keyof typeof providerLabels] ?? provider,
          amount,
          amountLabel: formatCurrency(amount),
          share: percentage(amount, collected)
        }))
        .sort((a, b) => b.amount - a.amount)
    };
  } catch (error) {
    console.error("Reports workspace read failed.", error);
    return empty;
  }
}
