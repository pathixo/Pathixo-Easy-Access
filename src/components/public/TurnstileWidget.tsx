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
}

export function TurnstileWidget({ onVerify, className = "" }: TurnstileWidgetProps) {
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
