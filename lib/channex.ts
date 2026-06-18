import "server-only";

type ChannexEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type ChannexProperty = {
  type: "property";
  id: string;
  attributes: {
    title: string;
    currency: string;
    timezone: string;
  };
};

type AvailabilityValue = {
  roomTypeId: string;
  date: string;
  availability: number;
};

function getChannexConfig() {
  return {
    apiKey: process.env.CHANNEX_API_KEY,
    propertyId: process.env.CHANNEX_PROPERTY_ID,
    baseUrl: process.env.CHANNEX_BASE_URL ?? "https://staging.channex.io/api/v.1",
    webhookSecret: process.env.CHANNEX_WEBHOOK_SECRET
  };
}

export function isChannexConfigured() {
  const config = getChannexConfig();
  return Boolean(config.apiKey && config.propertyId);
}

export function getChannexPropertyId() {
  return getChannexConfig().propertyId;
}

export function isValidChannexWebhookSecret(secret: string | null) {
  const configuredSecret = getChannexConfig().webhookSecret;
  return Boolean(configuredSecret && secret && configuredSecret === secret);
}

async function channexRequest<T>(path: string, init?: RequestInit) {
  const config = getChannexConfig();

  if (!config.apiKey) {
    throw new Error("CHANNEX_API_KEY is not configured.");
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "user-api-key": config.apiKey,
      ...init?.headers
    },
    cache: "no-store"
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Channex request failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return body as ChannexEnvelope<T>;
}

export async function testChannexConnection() {
  const config = getChannexConfig();

  if (!config.propertyId) {
    throw new Error("CHANNEX_PROPERTY_ID is not configured.");
  }

  const response = await channexRequest<ChannexProperty>(`/properties/${config.propertyId}`);
  return response.data;
}

export async function pushChannexAvailability(values: AvailabilityValue[]) {
  if (!values.length) {
    return;
  }

  await channexRequest("/availability", {
    method: "POST",
    body: JSON.stringify({
      values: values.map((value) => ({
        property_id: getChannexConfig().propertyId,
        room_type_id: value.roomTypeId,
        date: value.date,
        availability: value.availability
      }))
    })
  });
}

export function getChannexRoomMapping() {
  const rawMapping = process.env.CHANNEX_ROOM_MAPPING;

  if (!rawMapping) {
    return {} as Record<string, string>;
  }

  try {
    return JSON.parse(rawMapping) as Record<string, string>;
  } catch {
    throw new Error("CHANNEX_ROOM_MAPPING must be valid JSON.");
  }
}
