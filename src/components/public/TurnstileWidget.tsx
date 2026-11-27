"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  className?: string;
  /** Increment this value to force a fresh challenge (tokens are single-use). */
  resetKey?: number;
}

export function TurnstileWidget({
  onVerify,
  className = "",
  resetKey = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && siteKey === "1x00000000000000000000AA") {
      onVerify("1x00000000000000000000AA");
    }
  }, [siteKey, onVerify]);

  // Cloudflare tokens are single-use. A failed submit increments resetKey so
  // the next attempt gets a fresh challenge instead of a duplicate-token error.
  const lastResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (resetKey === lastResetKeyRef.current) return;
    lastResetKeyRef.current = resetKey;

    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        return;
      } catch {
        // Fall through to the dev token below.
      }
    }

    if (process.env.NODE_ENV !== "production" && siteKey === "1x00000000000000000000AA") {
      onVerify("1x00000000000000000000AA");
    }
  }, [resetKey, siteKey, onVerify]);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Safe ignore
      }
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onVerify("");
        },
        "error-callback": () => {
          if (process.env.NODE_ENV !== "production") {
            onVerify("1x00000000000000000000AA");
          }
        },
        theme: "dark",
        size: "flexible",
      });
    } catch (e) {
      console.warn("Turnstile render note:", e);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Safe ignore
        }
      }
    };
  }, [scriptLoaded, siteKey, onVerify]);

  return (
    <div className={`turnstile-container min-h-[65px] ${className}`}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
