import { ReservationStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

const activeStatuses = [
  ReservationStatus.NEW,
  ReservationStatus.CONFIRMED,
  ReservationStatus.PAYMENT_PENDING
];

export type DashboardMetrics = {
  occupancyRate: number;
  occupiedRooms: number;
  totalInventory: number;
  projectedRevenue: string;
  newReservations: number;
  paymentPending: number;
  openTasks: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!hasDatabase) {
    return {
      occupancyRate: 82,
      occupiedRooms: 31,
      totalInventory: 38,
      projectedRevenue: formatCurrency(58_350),
      newReservations: 1,
      paymentPending: 1,
      openTasks: 3
    };
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      select: { id: true }
    });

    if (!hotel) {
      return {
        occupancyRate: 0,
        occupiedRooms: 0,
        totalInventory: 0,
        projectedRevenue: formatCurrency(0),
        newReservations: 0,
        paymentPending: 0,
        openTasks: 0
      };
    }

    const [
      rooms,
      occupiedRooms,
      revenue,
      newReservations,
      paymentPending,
      openTasks
    ] = await Promise.all([
      prisma.roomType.aggregate({
        where: { hotelId: hotel.id },
        _sum: { inventory: true }
      }),
      prisma.reservation.count({
        where: {
          hotelId: hotel.id,
          status: { in: activeStatuses },
          checkIn: { lt: endOfDay },
          checkOut: { gt: startOfDay }
        }
      }),
      prisma.reservation.aggregate({
        where: {
          hotelId: hotel.id,
          status: {
            in: [ReservationStatus.CONFIRMED, ReservationStatus.PAYMENT_PENDING]
          },
          checkOut: { gte: startOfDay }
        },
        _sum: { totalAmount: true }
      }),
      prisma.reservation.count({
        where: {
          hotelId: hotel.id,
          status: ReservationStatus.NEW
        }
      }),
      prisma.reservation.count({
        where: {
          hotelId: hotel.id,
          status: ReservationStatus.PAYMENT_PENDING
        }
      }),
      prisma.task.count({
        where: {
          hotelId: hotel.id,
          done: false
        }
      })
    ]);

    const totalInventory = rooms._sum.inventory ?? 0;
    const occupancyRate =
      totalInventory > 0 ? Math.min(Math.round((occupiedRooms / totalInventory) * 100), 100) : 0;

    return {
      occupancyRate,
      occupiedRooms,
      totalInventory,
      projectedRevenue: formatCurrency(revenue._sum.totalAmount ?? 0),
      newReservations,
      paymentPending,
      openTasks
    };
  } catch (error) {
    console.error("Dashboard metrics read failed.", error);
    return {
      occupancyRate: 0,
      occupiedRooms: 0,
      totalInventory: 0,
      projectedRevenue: formatCurrency(0),
      newReservations: 0,
      paymentPending: 0,
      openTasks: 0
    };
  }
}
