import "server-only";

import { hasDatabase, prisma } from "@/lib/prisma";

const statusLabels = {
  READY: "Hazır",
  OCCUPIED: "Dolu",
  CLEANING: "Temizlikte",
  MAINTENANCE: "Bakımda",
  OUT_OF_SERVICE: "Kullanım dışı"
} as const;

export async function getRoomOperations() {
  if (!hasDatabase) {
    return { schemaReady: false, physicalRooms: [], roomTypes: [], summary: null };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      include: {
        rooms: {
          orderBy: { name: "asc" }
        },
        physicalRooms: {
          include: {
            roomType: true,
            stays: {
              where: { status: "CHECKED_IN" },
              include: { guest: true },
              take: 1
            }
          },
          orderBy: [{ floor: "asc" }, { number: "asc" }]
        }
      }
    });

    if (!hotel) {
      return { schemaReady: true, physicalRooms: [], roomTypes: [], summary: null };
    }

    const physicalRooms = hotel.physicalRooms.map((room) => {
      const activeStay = room.stays[0];

      return {
        id: room.id,
        number: room.number,
        floor: room.floor,
        roomTypeName: room.roomType.name,
        status: room.status,
        statusLabel: statusLabels[room.status],
        notes: room.notes,
        guestId: activeStay?.guest.id ?? null,
        guestName: activeStay?.guest.fullName ?? null,
        expectedCheckOut: activeStay?.expectedCheckOut ?? null
      };
    });

    return {
      schemaReady: true,
      roomTypes: hotel.rooms.map((room) => ({ id: room.id, name: room.name })),
      physicalRooms,
      summary: {
        total: physicalRooms.length,
        ready: physicalRooms.filter((room) => room.status === "READY").length,
        occupied: physicalRooms.filter((room) => room.status === "OCCUPIED").length,
        cleaning: physicalRooms.filter((room) => room.status === "CLEANING").length,
        maintenance: physicalRooms.filter(
          (room) => room.status === "MAINTENANCE" || room.status === "OUT_OF_SERVICE"
        ).length
      }
    };
  } catch (error) {
    console.error("Room operations read failed.", error);
    return { schemaReady: false, physicalRooms: [], roomTypes: [], summary: null };
  }
}
