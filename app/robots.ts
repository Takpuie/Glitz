import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/cart", "/api/", "/events/*/registration/"],
    },
    sitemap: "https://glitzafrica.com/sitemap.xml",
    host: "https://glitzafrica.com",
  };
}
