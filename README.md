This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Console testing (accessing from another device on your LAN)

If you want to open the dev site from a gaming console or any other device on your local network, follow these steps:

1. Make sure the dev server is bound to all network interfaces so other devices can reach it. In PowerShell run:

```powershell
$env:HOST = '0.0.0.0'
npm run dev
```

On macOS/Linux you can use:

```bash
HOST=0.0.0.0 npm run dev
```

2. On the console, open the browser and navigate to http://<your-pc-ip>:3000 (replace <your-pc-ip> with the IP address of the machine running Next.js).

3. Next.js development server protects requests to /_next/* by origin. You must add the exact console origin (scheme + host + port) to `allowedDevOrigins` in `next.config.ts`. Example entries:

```ts
// next.config.ts
export default {
	// ...other options
	allowedDevOrigins: [
		'http://localhost:3000',
		'http://192.168.0.229:3000',
		'http://11.22.27.67:3000', // example console IP — replace with your console's IP
	],
};
```

4. After editing `next.config.ts` restart the dev server (stop and run `npm run dev` again).

Troubleshooting
- If the console still shows a blocked `/ _next/*` request, check the console's network logs and ensure the origin exactly matches an entry in `allowedDevOrigins` (including port).
- If the console rejects non-HTTPS pages, consider using an HTTPS tunnel (ngrok) or test with a device/browser that allows HTTP local connections.
- If you're unsure what your console IP is, check the console network settings.

If you want, tell me the console's exact IP and port and I'll add it to `next.config.ts` for you.
