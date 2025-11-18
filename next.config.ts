import type { NextConfig } from "next";

// NOTE: In newer Next.js dev servers, when you access the site from
// another device/host (for example 192.168.0.229), Next.js may block
// cross-origin requests to /_next/* unless you explicitly allow the
// origin here via `allowedDevOrigins`.
//
// Adjust the entries below to match the exact origin(s) (scheme + host
// and port) you use while developing. Commonly that's http://<ip>:3000.
const nextConfig: NextConfig = {
  // ...other Next.js config options go here
  allowedDevOrigins: [
    // allow accessing the dev server from this local IP (common default port)
    "http://192.168.0.229:3000",
    // allow another observed dev origin
    "http://11.22.27.67:3000",
    // keep localhost allowed as well
    "http://localhost:3000",
  ],
};

export default nextConfig;
