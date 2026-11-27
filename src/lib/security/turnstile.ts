import "server-only";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies Cloudflare Turnstile token server-side
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  clientIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const hasRealSecret =
    !!secretKey && !secretKey.toLowerCase().includes("disabled");

  // In development, or when no real secret is configured (e.g. local prod
  // preview with placeholder env vars), allow the official Cloudflare test
  // tokens so the booth flow can be exercised end-to-end.
  if (!hasRealSecret || process.env.NODE_ENV !== "production") {
    if (!token || token === "1x00000000000000000000AA" || token === "test-dev-token") {
      return { success: true };
    }
  }

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { success: false, error: "Missing Turnstile verification token" };
  }

  if (!hasRealSecret) {
    return { success: false, error: "Turnstile secret key not configured" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, error: `Turnstile verification failed with HTTP ${res.status}` };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: `Turnstile verification failed: ${(data["error-codes"] || []).join(", ")}`,
    };
  } catch (err) {
    console.error("Turnstile verification network error:", err);
    return { success: false, error: "Verification service temporarily unavailable" };
  }
}
