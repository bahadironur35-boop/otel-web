import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const supportedProviders = new Set(["iyzico", "paytr", "bank-pos"]);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;

  if (!supportedProviders.has(provider)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  }

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  const suppliedSecret = request.nextUrl.searchParams.get("secret");

  if (!webhookSecret || suppliedSecret !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const paymentId = payload?.paymentId ?? payload?.payment_id ?? null;
  const transactionId = payload?.transactionId ?? payload?.transaction_id ?? null;
  const success = payload?.status === "success" || payload?.status === "paid";

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const providerMap: Record<string, PaymentProvider> = {
    iyzico: PaymentProvider.IYZICO,
    paytr: PaymentProvider.PAYTR,
    "bank-pos": PaymentProvider.BANK_POS
  };

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        provider: providerMap[provider],
        status: success ? PaymentStatus.PAID : PaymentStatus.FAILED,
        externalTransaction: transactionId,
        failureReason: success ? null : payload?.message ?? "Ödeme sağlayıcısı işlemi başarısız bildirdi",
        paidAt: success ? new Date() : null
      }
    }),
    prisma.reservation.update({
      where: { id: payment.reservationId },
      data: {
        status: success ? "CONFIRMED" : "PAYMENT_PENDING"
      }
    })
  ]);

  return NextResponse.json({ received: true });
}
