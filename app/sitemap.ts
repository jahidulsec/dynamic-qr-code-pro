import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const publicPages = ["/support", "/status", "/terms", "/security", "/privacy", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...publicPages.map((path) => ({
      url: `${siteConfig.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
