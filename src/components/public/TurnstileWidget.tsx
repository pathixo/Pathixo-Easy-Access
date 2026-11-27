"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: string) => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // If no sitekey is set or running in local dev with test dummy key, auto-verify
    if (!siteKey || siteKey === "1x00000000000000000000AA") {
      onVerify("1x00000000000000000000AA");
      return;
    }

    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !isRendered) {
        try {
          window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "dark",
            callback: (token: string) => onVerify(token),
            "error-callback": (err: string) => onError?.(err),
          });
          setIsRendered(true);
        } catch (e) {
          console.warn("Turnstile render error:", e);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }
  }, [siteKey, isRendered, onVerify, onError]);

  // Hide container if using automatic dev test key
  if (!siteKey || siteKey === "1x00000000000000000000AA") {
    return null;
  }

  return (
    <div className="flex justify-center my-3">
      <div ref={containerRef} />
    </div>
  );
}

