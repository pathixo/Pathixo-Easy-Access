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
  // Allow official Cloudflare test site keys in development
  if (process.env.NODE_ENV !== "production") {
    if (token === "1x00000000000000000000AA" || token === "test-dev-token") {
      return { success: true };
    }
  }

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { success: false, error: "Missing Turnstile verification token" };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // If not configured in development, pass through with warning
    if (process.env.NODE_ENV !== "production") {
      console.warn("WARN: TURNSTILE_SECRET_KEY not set. Skipping verification in development.");
      return { success: true };
    }
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
