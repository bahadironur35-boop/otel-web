import "server-only";

import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { StaffRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasDatabase, prisma } from "@/lib/prisma";

const COOKIE_NAME = "stayos_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const scrypt = promisify(scryptCallback);

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  source: "database" | "environment";
};

function getAuthConfig() {
  return {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    secret: process.env.SESSION_SECRET
  };
}

export function isAuthConfigured() {
  const { email, password, secret } = getAuthConfig();
  return Boolean(secret && ((email && password) || hasDatabase));
}

function signPayload(payload: string) {
  const { secret } = getAuthConfig();
  if (!secret) throw new Error("SESSION_SECRET is not configured.");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeUser(user: SessionUser) {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

function decodeUser(value: string): SessionUser | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return safeCompare(derivedKey.toString("hex"), key);
}

export async function createSession(user: SessionUser) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const encodedUser = encodeUser(user);
  const payload = `${encodedUser}.${expiresAt}`;
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

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!isAuthConfigured()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [encodedUser, expiresAt, signature] = token.split(".");
  const payload = `${encodedUser}.${expiresAt}`;
  if (!encodedUser || !expiresAt || !signature || Number(expiresAt) < Date.now()) return null;
  if (!safeCompare(signature, signPayload(payload))) return null;

  const user = decodeUser(encodedUser);
  if (!user) return null;

  if (user.source === "database" && hasDatabase) {
    try {
      const staffUser = await prisma.staffUser.findUnique({ where: { id: user.id } });
      if (!staffUser?.active) return null;
      return {
        id: staffUser.id,
        fullName: staffUser.fullName,
        email: staffUser.email,
        role: staffUser.role,
        source: "database"
      };
    } catch {
      return null;
    }
  }

  return user;
}

export async function hasValidSession() {
  return Boolean(await getCurrentUser());
}

export async function validateCredentials(email: string, password: string): Promise<SessionUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (hasDatabase) {
    try {
      const hotel = await prisma.hotel.findUnique({ where: { slug: "stayos-demo" }, select: { id: true } });
      const user = hotel
        ? await prisma.staffUser.findFirst({
            where: { hotelId: hotel.id, email: normalizedEmail, active: true }
          })
        : null;

      if (user && (await verifyPassword(password, user.passwordHash))) {
        await prisma.staffUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          source: "database"
        };
      }
    } catch (error) {
      console.error("Database staff authentication failed.", error);
    }
  }

  const config = getAuthConfig();
  if (
    config.email &&
    config.password &&
    safeCompare(normalizedEmail, config.email.toLowerCase()) &&
    safeCompare(password, config.password)
  ) {
    return {
      id: "environment-admin",
      fullName: "Sistem Yöneticisi",
      email: config.email,
      role: StaffRole.ADMIN,
      source: "environment"
    };
  }

  return null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRoles(roles: StaffRole[]) {
  const user = await requireAdmin();
  if (!roles.includes(user.role)) redirect("/admin");
  return user;
}
