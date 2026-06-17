import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "stayos_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAuthConfig() {
  return {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    secret: process.env.SESSION_SECRET
  };
}

export function isAuthConfigured() {
  const { email, password, secret } = getAuthConfig();
  return Boolean(email && password && secret);
}

function signPayload(payload: string) {
  const { secret } = getAuthConfig();

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function createSession() {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `admin.${expiresAt}`;
  const token = `${payload}.${signPayload(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function hasValidSession() {
  if (!isAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const [role, expiresAt, signature] = token.split(".");
  const payload = `${role}.${expiresAt}`;

  if (role !== "admin" || !expiresAt || !signature) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  return safeCompare(signature, signPayload(payload));
}

export async function validateCredentials(email: string, password: string) {
  const config = getAuthConfig();

  if (!config.email || !config.password) {
    return false;
  }

  return safeCompare(email, config.email) && safeCompare(password, config.password);
}

export async function requireAdmin() {
  if (!(await hasValidSession())) {
    redirect("/login");
  }
}
