"use server";

import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getRoomAvailability, parseStayDates } from "@/lib/availability";
import { sendReservationEmails } from "@/lib/email";
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

  const { checkIn, checkOut, nights, valid } = parseStayDates(checkInValue, checkOutValue);

  if (!valid || guests < 1) {
    redirect("/?booking=invalid-dates#demo");
  }

  const availability = await getRoomAvailability(roomTypeId, checkIn, checkOut);
  const roomType = availability.roomType;

  if (!roomType) {
    redirect("/?booking=room-not-found#demo");
  }

  if (!availability.available) {
    redirect("/?booking=unavailable#demo");
  }

  const totalAmount = roomType.nightlyRate * nights;

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
      totalAmount,
      currency: roomType.currency,
      notes: guestPhone ? `Telefon: ${guestPhone}` : null
    }
  });

  after(async () => {
    try {
      await sendReservationEmails({
        guestName,
        guestEmail,
        guestPhone,
        roomName: roomType.name,
        checkIn,
        checkOut,
        guests,
        totalAmount,
        currency: roomType.currency
      });
    } catch (error) {
      console.error("Reservation email notification failed.", error);
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  redirect("/?booking=success#demo");
}
