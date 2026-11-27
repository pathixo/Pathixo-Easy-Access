import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pathixo — Expo Platform",
    short_name: "Pathixo",
    description: "Pathixo builds proprietary AI products and engineers custom software solutions for visionary businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0c",
    theme_color: "#ccff00",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
