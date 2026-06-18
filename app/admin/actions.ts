"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ChannelStatus,
  ComplianceStatus,
  IntegrationStatus,
  PaymentProvider,
  PaymentStatus,
  ReservationStatus,
  RoomStatus,
  SyncDirection,
  SyncState,
  TaskPriority
} from "@prisma/client";
import { getRoomAvailability, parseStayDates } from "@/lib/availability";
import { testChannexConnection } from "@/lib/channex";
import { syncInventoryToChannex } from "@/lib/channex-sync";
import { hasDatabase, prisma } from "@/lib/prisma";
import { isPaymentProviderConfigured } from "@/lib/payment-providers";

async function getDemoHotelId() {
  const hotel = await prisma.hotel.upsert({
    where: { slug: "stayos-demo" },
    update: {},
    create: {
      name: "StayOS Demo Hotel",
      slug: "stayos-demo",
      city: "Muğla",
      country: "Türkiye"
    }
  });

  return hotel.id;
}

export async function createReservation(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/reservations?demo=1");
  }

  const hotelId = await getDemoHotelId();
  const roomTypeId = String(formData.get("roomTypeId") ?? "");
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim();
  const checkInValue = String(formData.get("checkIn") ?? "");
  const checkOutValue = String(formData.get("checkOut") ?? "");
  const channel = String(formData.get("channel") ?? "Web sitesi").trim();
  const totalAmount = Number(formData.get("totalAmount") ?? 0);
  const guests = Number(formData.get("guests") ?? 2);

  if (!roomTypeId || !guestName || !checkInValue || !checkOutValue || !totalAmount) {
    redirect("/admin/reservations?error=missing-fields");
  }

  const { checkIn, checkOut, valid } = parseStayDates(checkInValue, checkOutValue);

  if (!valid) {
    redirect("/admin/reservations?error=invalid-dates");
  }

  const availability = await getRoomAvailability(roomTypeId, checkIn, checkOut);

  if (!availability.available) {
    redirect("/admin/reservations?error=unavailable");
  }

  await prisma.reservation.create({
    data: {
      hotelId,
      roomTypeId,
      guestName,
      guestEmail: guestEmail || null,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      channel,
      status: ReservationStatus.NEW,
      totalAmount
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  redirect("/admin/reservations?created=1");
}

export async function confirmReservation(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/reservations?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/reservations?error=missing-fields");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CONFIRMED }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  redirect("/admin/reservations?confirmed=1");
}

export async function cancelReservation(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/reservations?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/reservations?error=missing-fields");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELLED }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  redirect("/admin/reservations?cancelled=1");
}

export async function createRoom(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/rooms?demo=1");
  }

  const hotelId = await getDemoHotelId();
  const name = String(formData.get("name") ?? "").trim();
  const capacity = String(formData.get("capacity") ?? "").trim();
  const nightlyRate = Number(formData.get("nightlyRate") ?? 0);
  const inventory = Number(formData.get("inventory") ?? 1);

  if (!name || !capacity || !nightlyRate) {
    redirect("/admin/rooms?error=missing-fields");
  }

  await prisma.roomType.create({
    data: {
      hotelId,
      name,
      capacity,
      nightlyRate,
      inventory,
      status: RoomStatus.READY
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/rooms");
  redirect("/admin/rooms?created=1");
}

export async function updateRoom(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/rooms?demo=1");
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const capacity = String(formData.get("capacity") ?? "").trim();
  const nightlyRate = Number(formData.get("nightlyRate") ?? 0);
  const inventory = Number(formData.get("inventory") ?? 0);
  const status = String(formData.get("status") ?? RoomStatus.READY) as RoomStatus;

  if (!id || !name || !capacity || nightlyRate < 1 || inventory < 0) {
    redirect("/admin/rooms?error=missing-fields");
  }

  await prisma.roomType.update({
    where: { id },
    data: {
      name,
      capacity,
      nightlyRate,
      inventory,
      status
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/rooms");
  revalidatePath("/admin/reservations");
  redirect("/admin/rooms?updated=1");
}

export async function deactivateRoom(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/rooms?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/rooms?error=missing-fields");
  }

  await prisma.roomType.update({
    where: { id },
    data: {
      inventory: 0,
      status: RoomStatus.MAINTENANCE
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/rooms");
  redirect("/admin/rooms?deactivated=1");
}

export async function createTask(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/tasks?demo=1");
  }

  const hotelId = await getDemoHotelId();
  const title = String(formData.get("title") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const dueAt = String(formData.get("dueAt") ?? "");
  const priority = String(formData.get("priority") ?? TaskPriority.MEDIUM) as TaskPriority;

  if (!title || !owner || !dueAt) {
    redirect("/admin/tasks?error=missing-fields");
  }

  await prisma.task.create({
    data: {
      hotelId,
      title,
      owner,
      dueAt: new Date(dueAt),
      priority
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  redirect("/admin/tasks?created=1");
}

export async function completeTask(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/tasks?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/tasks?error=missing-fields");
  }

  await prisma.task.update({
    where: { id },
    data: { done: true }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  redirect("/admin/tasks?completed=1");
}

export async function deleteTask(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/tasks?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/tasks?error=missing-fields");
  }

  await prisma.task.delete({
    where: { id }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  redirect("/admin/tasks?deleted=1");
}

export async function createChannel(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/channels?demo=1");
  }

  const hotelId = await getDemoHotelId();
  const name = String(formData.get("name") ?? "").trim();
  const inventory = Number(formData.get("inventory") ?? 0);

  if (!name || inventory < 0) {
    redirect("/admin/channels?error=missing-fields");
  }

  await prisma.channel.upsert({
    where: {
      hotelId_name: {
        hotelId,
        name
      }
    },
    update: {
      inventory,
      status: ChannelStatus.ACTION_REQUIRED,
      alert: "İlk senkronizasyon bekleniyor"
    },
    create: {
      hotelId,
      name,
      inventory,
      status: ChannelStatus.ACTION_REQUIRED,
      alert: "İlk senkronizasyon bekleniyor"
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/channels");
  redirect("/admin/channels?created=1");
}

export async function updateChannel(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/channels?demo=1");
  }

  const id = String(formData.get("id") ?? "");
  const inventory = Number(formData.get("inventory") ?? 0);
  const status = String(formData.get("status") ?? ChannelStatus.SYNCED) as ChannelStatus;
  const alert = String(formData.get("alert") ?? "Sorun yok").trim();

  if (!id || inventory < 0 || !alert) {
    redirect("/admin/channels?error=missing-fields");
  }

  await prisma.channel.update({
    where: { id },
    data: {
      inventory,
      status,
      alert
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/channels");
  redirect("/admin/channels?updated=1");
}

export async function syncChannel(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/channels?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/channels?error=missing-fields");
  }

  await prisma.channel.update({
    where: { id },
    data: {
      status: ChannelStatus.SYNCED,
      alert: "Sorun yok"
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/channels");
  redirect("/admin/channels?synced=1");
}

export async function deactivateChannel(formData: FormData) {
  if (!hasDatabase) {
    redirect("/admin/channels?demo=1");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/channels?error=missing-fields");
  }

  await prisma.channel.update({
    where: { id },
    data: {
      inventory: 0,
      status: ChannelStatus.ACTION_REQUIRED,
      alert: "Kanal satışa kapalı"
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/channels");
  redirect("/admin/channels?deactivated=1");
}

export async function testChannexAction() {
  let propertyTitle: string;

  try {
    const property = await testChannexConnection();
    propertyTitle = property.attributes.title;
  } catch (error) {
    console.error("Channex connection test failed.", error);
    redirect("/admin/channels?channex=failed");
  }

  redirect(`/admin/channels?channex=connected&property=${encodeURIComponent(propertyTitle)}`);
}

export async function syncChannexInventoryAction() {
  let result: Awaited<ReturnType<typeof syncInventoryToChannex>>;

  try {
    result = await syncInventoryToChannex(30);
  } catch (error) {
    console.error("Channex inventory sync failed.", error);
    redirect("/admin/channels?channex=sync-failed");
  }

  redirect(`/admin/channels?channex=synced&values=${result.values}&rooms=${result.roomTypes}`);
}

export async function updateIntegrationProvider(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? IntegrationStatus.NOT_CONFIGURED) as IntegrationStatus;
  const externalAccountId = String(formData.get("externalAccountId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) {
    redirect("/admin/channels?workspace=provider-error");
  }

  await prisma.integrationProvider.update({
    where: { id },
    data: {
      status,
      externalAccountId: externalAccountId || null,
      notes: notes || null,
      lastTestedAt: status === IntegrationStatus.CONNECTED ? new Date() : undefined
    }
  });

  revalidatePath("/admin/channels");
  redirect("/admin/channels?workspace=provider-updated");
}

export async function updateChannelConnection(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const providerId = String(formData.get("providerId") ?? "");
  const externalChannelId = String(formData.get("externalChannelId") ?? "").trim();
  const enabled = formData.get("enabled") === "on";

  if (!id || !providerId) {
    redirect("/admin/channels?workspace=connection-error");
  }

  await prisma.channelConnection.update({
    where: { id },
    data: {
      providerId,
      externalChannelId: externalChannelId || null,
      enabled,
      status: enabled ? IntegrationStatus.DEGRADED : IntegrationStatus.NOT_CONFIGURED,
      errorMessage: enabled ? "İlk başarılı senkronizasyon bekleniyor" : null
    }
  });

  revalidatePath("/admin/channels");
  redirect("/admin/channels?workspace=connection-updated");
}

export async function saveRoomMapping(formData: FormData) {
  const hotelId = await getDemoHotelId();
  const providerId = String(formData.get("providerId") ?? "");
  const roomTypeId = String(formData.get("roomTypeId") ?? "");
  const externalRoomTypeId = String(formData.get("externalRoomTypeId") ?? "").trim();
  const externalRatePlanId = String(formData.get("externalRatePlanId") ?? "").trim();

  if (!providerId || !roomTypeId || !externalRoomTypeId) {
    redirect("/admin/channels?workspace=mapping-error");
  }

  await prisma.roomMapping.upsert({
    where: {
      providerId_roomTypeId: {
        providerId,
        roomTypeId
      }
    },
    update: {
      externalRoomTypeId,
      externalRatePlanId: externalRatePlanId || null,
      active: true
    },
    create: {
      hotelId,
      providerId,
      roomTypeId,
      externalRoomTypeId,
      externalRatePlanId: externalRatePlanId || null
    }
  });

  revalidatePath("/admin/channels");
  redirect("/admin/channels?workspace=mapping-saved");
}

export async function deleteRoomMapping(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/channels?workspace=mapping-error");
  }

  await prisma.roomMapping.delete({
    where: { id }
  });

  revalidatePath("/admin/channels");
  redirect("/admin/channels?workspace=mapping-deleted");
}

export async function runConnectionSync(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/channels?workspace=sync-error");
  }

  const connection = await prisma.channelConnection.findUnique({
    where: { id },
    include: { channelCatalog: true }
  });

  if (!connection) {
    redirect("/admin/channels?workspace=sync-error");
  }

  const mappingCount = await prisma.roomMapping.count({
    where: {
      providerId: connection.providerId,
      active: true
    }
  });

  const success = connection.enabled && mappingCount > 0;
  const message = success
    ? `${mappingCount} oda eşleştirmesi doğrulandı. Gerçek API erişimi geldiğinde veri gönderimi bu noktadan çalışacak.`
    : "Senkronizasyon için kanal etkin olmalı ve en az bir oda eşleştirmesi bulunmalı.";

  await prisma.$transaction([
    prisma.channelConnection.update({
      where: { id },
      data: {
        status: success ? IntegrationStatus.CONNECTED : IntegrationStatus.DEGRADED,
        lastSyncedAt: success ? new Date() : undefined,
        errorMessage: success ? null : message
      }
    }),
    prisma.syncLog.create({
      data: {
        hotelId: connection.hotelId,
        providerId: connection.providerId,
        channelConnectionId: connection.id,
        direction: SyncDirection.BIDIRECTIONAL,
        resource: "INVENTORY_RATES_BOOKINGS",
        state: success ? SyncState.SUCCESS : SyncState.FAILED,
        recordsCount: mappingCount,
        message
      }
    })
  ]);

  revalidatePath("/admin/channels");
  redirect(`/admin/channels?workspace=${success ? "sync-success" : "sync-error"}`);
}

export async function updateComplianceItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? ComplianceStatus.NOT_STARTED) as ComplianceStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) {
    redirect("/admin/compliance?status=error");
  }

  await prisma.complianceItem.update({
    where: { id },
    data: {
      status,
      notes: notes || null
    }
  });

  revalidatePath("/admin/compliance");
  redirect("/admin/compliance?status=updated");
}

export async function createPaymentRequest(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const provider = String(formData.get("provider") ?? PaymentProvider.MANUAL) as PaymentProvider;
  const paymentLink = String(formData.get("paymentLink") ?? "").trim();
  const expiresAtValue = String(formData.get("expiresAt") ?? "");

  if (!reservationId) {
    redirect("/admin/payments?result=error");
  }

  if (!isPaymentProviderConfigured(provider)) {
    redirect("/admin/payments?result=provider-not-configured");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId }
  });

  if (!reservation) {
    redirect("/admin/payments?result=error");
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        hotelId: reservation.hotelId,
        reservationId,
        provider,
        status: paymentLink ? PaymentStatus.LINK_SENT : PaymentStatus.CREATED,
        amount: reservation.totalAmount,
        currency: reservation.currency,
        paymentLink: paymentLink || null,
        expiresAt: expiresAtValue ? new Date(expiresAtValue) : null
      }
    }),
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.PAYMENT_PENDING }
    })
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/reservations");
  redirect("/admin/payments?result=created");
}

export async function updatePaymentStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? PaymentStatus.PENDING) as PaymentStatus;
  const externalTransaction = String(formData.get("externalTransaction") ?? "").trim();
  const failureReason = String(formData.get("failureReason") ?? "").trim();

  if (!id) {
    redirect("/admin/payments?result=error");
  }

  const payment = await prisma.payment.findUnique({
    where: { id }
  });

  if (!payment) {
    redirect("/admin/payments?result=error");
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id },
      data: {
        status,
        externalTransaction: externalTransaction || null,
        failureReason: failureReason || null,
        paidAt: status === PaymentStatus.PAID ? new Date() : payment.paidAt
      }
    }),
    prisma.reservation.update({
      where: { id: payment.reservationId },
      data: {
        status:
          status === PaymentStatus.PAID
            ? ReservationStatus.CONFIRMED
            : status === PaymentStatus.CANCELLED
              ? ReservationStatus.CANCELLED
              : ReservationStatus.PAYMENT_PENDING
      }
    })
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/reservations");
  redirect("/admin/payments?result=updated");
}
