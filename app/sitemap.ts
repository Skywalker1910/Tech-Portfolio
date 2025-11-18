import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://example.com/", lastModified: new Date() },
    { url: "https://example.com/projects", lastModified: new Date() },
    { url: "https://example.com/education", lastModified: new Date() },
    { url: "https://example.com/experience", lastModified: new Date() },
    { url: "https://example.com/academics", lastModified: new Date() },
  ];
}
