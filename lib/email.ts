import "server-only";

import { Resend } from "resend";
import { formatCurrency, formatDateRange } from "@/lib/format";

type ReservationEmailInput = {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  currency: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    notificationEmail: process.env.RESERVATION_NOTIFICATION_EMAIL
  };
}

export function isEmailConfigured() {
  const config = getEmailConfig();
  return Boolean(config.apiKey && config.from && config.notificationEmail);
}

export async function sendReservationEmails(input: ReservationEmailInput) {
  const config = getEmailConfig();

  if (!config.apiKey || !config.from || !config.notificationEmail) {
    return {
      sent: false,
      reason: "not-configured"
    } as const;
  }

  const resend = new Resend(config.apiKey);
  const guestName = escapeHtml(input.guestName);
  const guestEmail = escapeHtml(input.guestEmail);
  const guestPhone = input.guestPhone ? escapeHtml(input.guestPhone) : "Belirtilmedi";
  const roomName = escapeHtml(input.roomName);
  const dates = formatDateRange(input.checkIn, input.checkOut);
  const amount = formatCurrency(input.totalAmount, input.currency);

  const managerEmail = resend.emails.send({
    from: config.from,
    to: [config.notificationEmail],
    replyTo: input.guestEmail,
    subject: `Yeni rezervasyon talebi: ${input.guestName}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#13201f">
        <h2 style="margin:0 0 16px">Yeni rezervasyon talebi</h2>
        <p><strong>Misafir:</strong> ${guestName}</p>
        <p><strong>E-posta:</strong> ${guestEmail}</p>
        <p><strong>Telefon:</strong> ${guestPhone}</p>
        <p><strong>Oda:</strong> ${roomName}</p>
        <p><strong>Tarih:</strong> ${dates}</p>
        <p><strong>Misafir sayısı:</strong> ${input.guests}</p>
        <p><strong>Tahmini tutar:</strong> ${amount}</p>
        <p>Rezervasyon yönetim paneline <strong>Yeni</strong> durumuyla kaydedildi.</p>
      </div>
    `
  });

  const guestEmailRequest = resend.emails.send({
    from: config.from,
    to: [input.guestEmail],
    subject: "Rezervasyon talebiniz alındı",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#13201f">
        <h2 style="margin:0 0 16px">Talebiniz alındı</h2>
        <p>Merhaba ${guestName},</p>
        <p><strong>${roomName}</strong> için ${dates} tarihli rezervasyon talebinizi aldık.</p>
        <p>Tahmini tutar: <strong>${amount}</strong></p>
        <p>Otel ekibi müsaitliği kontrol ettikten sonra sizinle iletişime geçecek.</p>
      </div>
    `
  });

  const results = await Promise.allSettled([managerEmail, guestEmailRequest]);
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length) {
    console.error("One or more reservation emails failed.", failures);
  }

  return {
    sent: failures.length === 0,
    reason: failures.length ? "partial-failure" : "sent"
  } as const;
}
