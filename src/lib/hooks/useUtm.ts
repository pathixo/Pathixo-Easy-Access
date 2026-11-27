"use client";

import { useEffect, useState } from "react";

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

const STORAGE_KEY = "px_expo_utm";

export function useUtm(): UtmParams {
  const [utm, setUtm] = useState<UtmParams>({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
  });

  useEffect(() => {
    try {
      // 1. Try reading existing saved UTM from sessionStorage
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUtm(JSON.parse(saved));
      }

      // 2. Parse from current query parameters
      const params = new URLSearchParams(window.location.search);
      const newUtm: UtmParams = {
        utm_source: params.get("utm_source") || (saved ? JSON.parse(saved).utm_source : "qr_booth"),
        utm_medium: params.get("utm_medium") || (saved ? JSON.parse(saved).utm_medium : null),
        utm_campaign: params.get("utm_campaign") || (saved ? JSON.parse(saved).utm_campaign : "expo_mart_2026"),
        utm_term: params.get("utm_term") || (saved ? JSON.parse(saved).utm_term : null),
        utm_content: params.get("utm_content") || (saved ? JSON.parse(saved).utm_content : null),
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUtm));
      setUtm(newUtm);
    } catch {
      // Ignore sessionStorage errors in incognito or restricted mode
    }
  }, []);

  return utm;
}
