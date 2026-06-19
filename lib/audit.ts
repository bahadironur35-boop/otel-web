import "server-only";

import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase, prisma } from "@/lib/prisma";

type AuditEvent = {
  hotelId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditEvent(event: AuditEvent) {
  if (!hasDatabase) return;

  try {
    const user = await getCurrentUser();
    if (!user) return;

    await prisma.auditLog.create({
      data: {
        hotelId: event.hotelId,
        actorId: user.source === "database" ? user.id : null,
        actorName: user.fullName,
        actorEmail: user.email,
        actorRole: user.role,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId ?? null,
        description: event.description,
        metadata: event.metadata
      }
    });
  } catch (error) {
    console.error("Audit event could not be recorded.", error);
  }
}
