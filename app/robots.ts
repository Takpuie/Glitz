import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/cart", "/api/"],
    },
    sitemap: "https://glitzafrica.com/sitemap.xml",
    host: "https://glitzafrica.com",
  };
}
