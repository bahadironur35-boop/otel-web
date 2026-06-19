import "server-only";

import { hasDatabase, prisma } from "@/lib/prisma";

export const auditActionLabels: Record<string, string> = {
  RESERVATION_CREATED: "Rezervasyon oluşturuldu",
  RESERVATION_CONFIRMED: "Rezervasyon onaylandı",
  RESERVATION_CANCELLED: "Rezervasyon iptal edildi",
  ROOM_STATUS_UPDATED: "Oda durumu değişti",
  PAYMENT_REQUEST_CREATED: "Tahsilat talebi oluşturuldu",
  PAYMENT_STATUS_UPDATED: "Tahsilat durumu değişti",
  GUEST_CHECKED_IN: "Check-in yapıldı",
  GUEST_CHECKED_OUT: "Check-out yapıldı",
  FOLIO_ITEM_ADDED: "Folyo kalemi eklendi",
  FOLIO_ITEM_REMOVED: "Folyo kalemi kaldırıldı",
  STAFF_USER_CREATED: "Personel hesabı oluşturuldu",
  STAFF_USER_UPDATED: "Personel hesabı güncellendi",
  STAFF_USER_ACTIVATED: "Personel hesabı etkinleştirildi",
  STAFF_USER_DEACTIVATED: "Personel hesabı pasifleştirildi"
};

const roleLabels: Record<string, string> = {
  ADMIN: "Sistem yöneticisi",
  MANAGER: "Otel yöneticisi",
  RECEPTION: "Resepsiyon",
  HOUSEKEEPING: "Housekeeping",
  ACCOUNTING: "Muhasebe"
};

function parseDate(value?: string, end = false) {
  if (!value) return undefined;
  const date = new Date(`${value}T${end ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function getActivityWorkspace(filters: {
  q?: string;
  action?: string;
  actor?: string;
  from?: string;
  to?: string;
}) {
  if (!hasDatabase) return { schemaReady: false, logs: [], actors: [], actions: [] };

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: "stayos-demo" },
      select: { id: true }
    });
    if (!hotel) return { schemaReady: true, logs: [], actors: [], actions: [] };

    const q = filters.q?.trim();
    const from = parseDate(filters.from);
    const to = parseDate(filters.to, true);
    const [logs, actorRows, actionRows] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          hotelId: hotel.id,
          action: filters.action && filters.action !== "ALL" ? filters.action : undefined,
          actorEmail: filters.actor && filters.actor !== "ALL" ? filters.actor : undefined,
          createdAt: from || to ? { gte: from, lte: to } : undefined,
          OR: q
            ? [
                { description: { contains: q, mode: "insensitive" } },
                { actorName: { contains: q, mode: "insensitive" } },
                { actorEmail: { contains: q, mode: "insensitive" } },
                { entityType: { contains: q, mode: "insensitive" } }
              ]
            : undefined
        },
        orderBy: { createdAt: "desc" },
        take: 250
      }),
      prisma.auditLog.findMany({
        where: { hotelId: hotel.id },
        distinct: ["actorEmail"],
        select: { actorEmail: true, actorName: true },
        orderBy: { actorName: "asc" }
      }),
      prisma.auditLog.findMany({
        where: { hotelId: hotel.id },
        distinct: ["action"],
        select: { action: true },
        orderBy: { action: "asc" }
      })
    ]);

    return {
      schemaReady: true,
      logs: logs.map((log) => ({
        id: log.id,
        actorName: log.actorName,
        actorEmail: log.actorEmail,
        actorRoleLabel: roleLabels[log.actorRole] ?? log.actorRole,
        actionLabel: auditActionLabels[log.action] ?? log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        createdAt: log.createdAt
      })),
      actors: actorRows,
      actions: actionRows.map((row) => ({
        value: row.action,
        label: auditActionLabels[row.action] ?? row.action
      }))
    };
  } catch (error) {
    console.error("Activity workspace read failed.", error);
    return { schemaReady: false, logs: [], actors: [], actions: [] };
  }
}
