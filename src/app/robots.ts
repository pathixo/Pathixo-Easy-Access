import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expo.pathixo.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/spin", "/privacy", "/terms"],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
