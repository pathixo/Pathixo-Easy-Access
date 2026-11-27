import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

export const ADMIN_SESSION_COOKIE = "px_admin_session";
const SESSION_EXPIRY = "12h";

const SUPER_ADMIN_USERNAME = "Adminji12";
const SUPER_ADMIN_PASSWORD = "Admin@12@12";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET || "default_development_secret_minimum_32_characters_long!";
  return new TextEncoder().encode(secret);
}

export function isSuperAdminCredential(username: string, password: string): boolean {
  return username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD;
}

export async function createAdminToken(): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ role: "super_admin", username: SUPER_ADMIN_USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(key);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "super_admin" && payload.username === SUPER_ADMIN_USERNAME;
  } catch {
    return false;
  }
}

function shouldUseSecureCookie(): boolean {
  try {
    const host = headers().get("host")?.toLowerCase() ?? "";
    const isLocalHost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (isLocalHost) return false;
    const forwardedProto = headers().get("x-forwarded-proto");
    if (forwardedProto) return forwardedProto.split(",")[0]?.trim() === "https";
  } catch {
    // ignore
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = await createAdminToken();
  cookies().set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  cookies().delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSessionFromCookie(): Promise<boolean> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
