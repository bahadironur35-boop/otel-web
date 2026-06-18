import "server-only";

import { PaymentProvider, PaymentStatus } from "@prisma/client";

export type PaymentLinkRequest = {
  paymentId: string;
  amount: number;
  currency: string;
  guestName: string;
  guestEmail?: string | null;
  description: string;
  callbackUrl: string;
};

export type PaymentLinkResult = {
  externalTransaction: string;
  paymentLink: string;
  status: PaymentStatus;
  expiresAt?: Date;
};

export interface PaymentProviderAdapter {
  provider: PaymentProvider;
  createPaymentLink(input: PaymentLinkRequest): Promise<PaymentLinkResult>;
  verifyWebhook(payload: string, signature: string | null): boolean;
}

export function isPaymentProviderConfigured(provider: PaymentProvider) {
  if (provider === PaymentProvider.IYZICO) {
    return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
  }

  if (provider === PaymentProvider.PAYTR) {
    return Boolean(
      process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT
    );
  }

  return provider === PaymentProvider.MANUAL;
}
