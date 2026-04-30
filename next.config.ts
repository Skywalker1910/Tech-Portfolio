import type { NextConfig } from "next";

// NOTE: In newer Next.js dev servers, when you access the site from
// another device/host (for example 192.168.0.229), Next.js may block
// cross-origin requests to /_next/* unless you explicitly allow the
// origin here via `allowedDevOrigins`.
//
// Adjust the entries below to match the exact origin(s) (scheme + host
// and port) you use while developing. Commonly that's http://<ip>:3000.

// When NEXT_PUBLIC_GITHUB_PAGES=true, produce a fully-static export
// targeting https://skywalker1910.github.io/Tech-Portfolio/
const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // --- GitHub Pages static-export settings (no-op for Amplify/main) ---
  ...(isGitHubPages && {
    output: "export",
    basePath: "/Tech-Portfolio",
    assetPrefix: "/Tech-Portfolio",
    trailingSlash: true,
  }),
  // Replace API route handlers with empty stubs in the GitHub Pages static
  // export. The routes cannot run on a static host and force-dynamic would
  // cause a build error under output:"export".
  ...(isGitHubPages && {
    webpack(config: import("webpack").Configuration) {
      config.module = config.module ?? { rules: [] };
      config.module.rules = config.module.rules ?? [];
      (config.module.rules as import("webpack").RuleSetRule[]).push({
        test: /app[\\/]api[\\/].*[\\/]route\.ts$/,
        use: "null-loader",
      });
      return config;
    },
  }),
  images: {
    // next/image optimisation requires a server; disable for the static build
    unoptimized: isGitHubPages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
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
