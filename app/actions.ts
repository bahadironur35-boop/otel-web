"use server";

import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasDatabase, prisma } from "@/lib/prisma";

export async function createPublicReservation(formData: FormData) {
  if (!hasDatabase) {
    redirect("/?booking=demo#demo");
  }

  const roomTypeId = String(formData.get("roomTypeId") ?? "");
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim();
  const guestPhone = String(formData.get("guestPhone") ?? "").trim();
  const checkInValue = String(formData.get("checkIn") ?? "");
  const checkOutValue = String(formData.get("checkOut") ?? "");
  const guests = Number(formData.get("guests") ?? 2);

  if (!roomTypeId || !guestName || !guestEmail || !checkInValue || !checkOutValue) {
    redirect("/?booking=missing#demo");
  }

  const checkIn = new Date(`${checkInValue}T12:00:00`);
  const checkOut = new Date(`${checkOutValue}T10:00:00`);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);

  if (!Number.isFinite(nights) || nights < 1 || guests < 1) {
    redirect("/?booking=invalid-dates#demo");
  }

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { hotel: true }
  });

  if (!roomType) {
    redirect("/?booking=room-not-found#demo");
  }

  await prisma.reservation.create({
    data: {
      hotelId: roomType.hotelId,
      roomTypeId: roomType.id,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      guests,
      channel: "Web sitesi",
      status: ReservationStatus.NEW,
      totalAmount: roomType.nightlyRate * nights,
      currency: roomType.currency,
      notes: guestPhone ? `Telefon: ${guestPhone}` : null
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  redirect("/?booking=success#demo");
}
