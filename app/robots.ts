import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/yonetim", "/api/"] },
    sitemap: "https://kap-kap.vercel.app/sitemap.xml",
  };
}
