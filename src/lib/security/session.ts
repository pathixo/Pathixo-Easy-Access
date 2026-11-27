import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

export const VISITOR_SESSION_COOKIE = "px_visitor_session";
const SESSION_EXPIRY = "12h";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "default_development_secret_minimum_32_characters_long!";
  return new TextEncoder().encode(secret);
}

export interface VisitorPayload {
  visitorId: string;
}

/**
 * Creates a signed JWT for the registered visitor
 */
export async function createVisitorToken(visitorId: string): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ visitorId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(key);
}

/**
 * Verifies and decodes the visitor JWT
 */
export async function verifyVisitorToken(token: string): Promise<VisitorPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (typeof payload.visitorId === "string" && payload.visitorId.length > 0) {
      return { visitorId: payload.visitorId };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the visitor session from current request cookies
 */
export async function getVisitorSession(): Promise<VisitorPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(VISITOR_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyVisitorToken(token);
}

/**
 * A production build served over plain HTTP on localhost/LAN must not set
 * `Secure`, or the browser silently drops the cookie and the visitor can never
 * spin. Real deployments behind HTTPS keep `Secure` enabled.
 */
function shouldUseSecureCookie(): boolean {
  try {
    const headerStore = headers();
    const host = headerStore.get("host")?.toLowerCase() ?? "";
    const isLocalHost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);

    if (isLocalHost) return false;

    const forwardedProto = headerStore.get("x-forwarded-proto");
    if (forwardedProto) {
      return forwardedProto.split(",")[0]?.trim() === "https";
    }
  } catch {
    // headers() is unavailable outside a request scope; fall back to env.
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return siteUrl.startsWith("https://");
}

/**
 * Sets the signed HttpOnly visitor cookie on the response
 */
export async function setVisitorSessionCookie(visitorId: string): Promise<void> {
  const token = await createVisitorToken(visitorId);
  const cookieStore = cookies();

  cookieStore.set(VISITOR_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60, // 12 hours
  });
}

/**
 * Clears the visitor session cookie
 */
export async function clearVisitorSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(VISITOR_SESSION_COOKIE);
}
