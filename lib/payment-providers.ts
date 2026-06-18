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

export const paymentProviderDefinitions = [
  {
    id: PaymentProvider.MANUAL,
    name: "Manuel ödeme bağlantısı",
    description: "Harici ödeme linki, havale veya telefonla tahsilat takibi.",
    requiredVariables: [] as string[]
  },
  {
    id: PaymentProvider.IYZICO,
    name: "iyzico",
    description: "Türkiye odaklı ödeme bağlantısı ve sanal POS entegrasyonu.",
    requiredVariables: ["IYZICO_API_KEY", "IYZICO_SECRET_KEY"]
  },
  {
    id: PaymentProvider.PAYTR,
    name: "PayTR",
    description: "iFrame API ve ödeme bildirimi ile tahsilat.",
    requiredVariables: ["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT"]
  },
  {
    id: PaymentProvider.BANK_POS,
    name: "Banka sanal POS",
    description: "Banka veya ortak ödeme sayfası bağlantısı.",
    requiredVariables: ["BANK_POS_PAYMENT_URL"]
  }
] as const;

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

  if (provider === PaymentProvider.BANK_POS) {
    return Boolean(process.env.BANK_POS_PAYMENT_URL);
  }

  return provider === PaymentProvider.MANUAL;
}

export function getPaymentProviderSettings() {
  return paymentProviderDefinitions.map((provider) => ({
    ...provider,
    configured: isPaymentProviderConfigured(provider.id)
  }));
}

export function getConfiguredPaymentProviders() {
  return getPaymentProviderSettings().filter((provider) => provider.configured);
}
