"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ChannelStatus, ReservationStatus, RoomStatus, TaskPriority } from "@prisma/client";
import { getRoomAvailability, parseStayDates } from "@/lib/availability";
import { testChannexConnection } from "@/lib/channex";
import { syncInventoryToChannex } from "@/lib/channex-sync";
import { hasDatabase, prisma } from "@/lib/prisma";

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
