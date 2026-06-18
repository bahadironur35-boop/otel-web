import { NextRequest, NextResponse } from "next/server";
import { isValidChannexWebhookSecret } from "@/lib/channex";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!isValidChannexWebhookSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  console.info("Channex webhook received.", {
    event: payload.event ?? payload.type ?? "unknown",
    bookingRevisionId:
      payload.booking_revision_id ??
      payload.payload?.booking_revision_id ??
      payload.data?.attributes?.booking_revision_id ??
      null
  });

  return NextResponse.json({ status: "accepted" });
}
