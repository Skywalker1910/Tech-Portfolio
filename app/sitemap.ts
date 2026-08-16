import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://adityamore.dev/", lastModified: new Date() },
    { url: "https://adityamore.dev/projects", lastModified: new Date() },
    { url: "https://adityamore.dev/education", lastModified: new Date() },
    { url: "https://adityamore.dev/experience", lastModified: new Date() },
    { url: "https://adityamore.dev/skills", lastModified: new Date() },
    { url: "https://adityamore.dev/socials", lastModified: new Date() },
    { url: "https://adityamore.dev/contact", lastModified: new Date() },
    { url: "https://adityamore.dev/notice", lastModified: new Date() },
    { url: "https://adityamore.dev/privacy", lastModified: new Date() },
  ];
}
