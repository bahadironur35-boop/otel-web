import { formatCurrency, formatDateRange } from "@/lib/format";
import { hasDatabase, prisma } from "@/lib/prisma";

export const rooms = [
  {
    name: "Deniz Suite",
    price: "₺6.900",
    status: "Hazır",
    occupancy: "2 yetişkin",
    source: "Web sitesi"
  },
  {
    name: "Aile Odası",
    price: "₺5.400",
    status: "Ekstra yatak",
    occupancy: "2 yetişkin, 1 çocuk",
    source: "Booking"
  },
  {
    name: "Bahçe Deluxe",
    price: "₺4.850",
    status: "Temizlikte",
    occupancy: "2 yetişkin",
    source: "Expedia"
  }
];

export const reservations = [
  {
    guest: "Ayşe Demir",
    room: "Deniz Suite",
    dates: "12-16 Temmuz 2026",
    channel: "Web sitesi",
    status: "Onaylandı",
    amount: "₺27.600"
  },
  {
    guest: "Mert Kaya",
    room: "Aile Odası",
    dates: "18-21 Temmuz 2026",
    channel: "Booking",
    status: "Ödeme bekliyor",
    amount: "₺16.200"
  },
  {
    guest: "Sofia Miller",
    room: "Bahçe Deluxe",
    dates: "22-25 Temmuz 2026",
    channel: "Airbnb",
    status: "Yeni",
    amount: "₺14.550"
  }
];

export const tasks = [
  {
    id: "demo-task-maintenance",
    title: "203 numara bakım kontrolü",
    owner: "Teknik ekip",
    due: "Bugün 13:30",
    priority: "Yüksek",
    done: false
  },
  {
    id: "demo-task-checkin",
    title: "Deniz Suite check-in hazırlığı",
    owner: "Housekeeping",
    due: "Bugün 14:00",
    priority: "Orta",
    done: false
  },
  {
    id: "demo-task-vip",
    title: "VIP misafir karşılama notu",
    owner: "Ön büro",
    due: "Yarın 10:00",
    priority: "Orta",
    done: false
  }
];

export const channels = [
  {
    name: "Booking",
    status: "Senkron",
    inventory: "42 oda",
    alert: "Aile Odası fiyat planı kontrol edilmeli"
  },
  {
    name: "Expedia",
    status: "Senkron",
    inventory: "39 oda",
    alert: "Sorun yok"
  },
  {
    name: "Airbnb",
    status: "Gecikmeli",
    inventory: "12 oda",
    alert: "Stok güncellemesi 18 dakika gecikti"
  }
];

const statusLabels = {
  NEW: "Yeni",
  CONFIRMED: "Onaylandı",
  PAYMENT_PENDING: "Ödeme bekliyor",
  CANCELLED: "İptal edildi",
  READY: "Hazır",
  CLEANING: "Temizlikte",
  MAINTENANCE: "Bakımda",
  EXTRA_BED: "Ekstra yatak",
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
  SYNCED: "Senkron",
  DELAYED: "Gecikmeli",
  ACTION_REQUIRED: "İşlem gerekli"
} as const;

export async function getHotelData() {
  if (!hasDatabase) {
    return {
      rooms,
      reservations,
      tasks,
      channels
    };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        rooms: {
          orderBy: { createdAt: "asc" }
        },
        reservations: {
          include: { roomType: true },
          orderBy: { createdAt: "desc" }
        },
        tasks: {
          orderBy: [{ done: "asc" }, { dueAt: "asc" }]
        },
        channels: {
          orderBy: { name: "asc" }
        }
      }
    });

    if (!hotel) {
      return {
        rooms,
        reservations,
        tasks,
        channels
      };
    }

    return {
      rooms: hotel.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        price: formatCurrency(room.nightlyRate, room.currency),
        status: statusLabels[room.status],
        occupancy: room.capacity,
        source: "Admin panel",
        inventory: room.inventory
      })),
      reservations: hotel.reservations.map((reservation) => ({
        id: reservation.id,
        guest: reservation.guestName,
        room: reservation.roomType.name,
        dates: formatDateRange(reservation.checkIn, reservation.checkOut),
        channel: reservation.channel,
        status: statusLabels[reservation.status],
        amount: formatCurrency(reservation.totalAmount, reservation.currency)
      })),
      tasks: hotel.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        owner: task.owner,
        due: new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }).format(task.dueAt),
        priority: statusLabels[task.priority],
        done: task.done
      })),
      channels: hotel.channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        status: statusLabels[channel.status],
        inventory: `${channel.inventory} oda`,
        alert: channel.alert
      }))
    };
  } catch (error) {
    console.error("Database read failed, falling back to demo data.", error);
    return {
      rooms,
      reservations,
      tasks,
      channels
    };
  }
}

export async function getRoomOptions() {
  if (!hasDatabase) {
    return rooms.map((room) => ({
      id: room.name,
      name: room.name
    }));
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        rooms: {
          select: {
            id: true,
            name: true
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    return hotel?.rooms ?? [];
  } catch (error) {
    console.error("Room options read failed, falling back to demo data.", error);
    return rooms.map((room) => ({
      id: room.name,
      name: room.name
    }));
  }
}
