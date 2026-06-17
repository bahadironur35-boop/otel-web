"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ReservationStatus, RoomStatus, TaskPriority } from "@prisma/client";
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
  const checkIn = String(formData.get("checkIn") ?? "");
  const checkOut = String(formData.get("checkOut") ?? "");
  const channel = String(formData.get("channel") ?? "Web sitesi").trim();
  const totalAmount = Number(formData.get("totalAmount") ?? 0);
  const guests = Number(formData.get("guests") ?? 2);

  if (!roomTypeId || !guestName || !checkIn || !checkOut || !totalAmount) {
    redirect("/admin/reservations?error=missing-fields");
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
