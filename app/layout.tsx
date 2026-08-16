import "./globals.css";
import type { ReactNode } from "react";
import ConditionalLayout from "../components/ConditionalLayout";
import CustomCursor from "../components/CustomCursor";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "Aditya More — AI Engineer & ML Engineer",
  description: "M.S. Computer Science graduate (Clemson University) seeking AI Engineer/ML Engineer/Data Scientist roles. Skilled across the full ML pipeline — from data preprocessing and model development to evaluation and deployment using Python and modern ML frameworks.",
  metadataBase: new URL("https://adityamore.dev"),
  openGraph: {
    title: "Aditya More — AI Engineer & ML Engineer",
    description: "CS graduate with expertise in machine learning, data analytics, AI security research, and Python-based ML pipelines.",
    type: "website"
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{__html:`document.documentElement.classList.remove('dark')`}} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded">
          Skip to content
        </a>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <CustomCursor />
      </body>
    </html>
  );
}
