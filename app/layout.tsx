import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import CustomCursor from "../components/CustomCursor";
import BackgroundManager from "../components/BackgroundManager";
import GhPagesBanner from "../components/GhPagesBanner";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "Aditya More — AI Engineer & ML Engineer",
  description: "M.S. Computer Science graduate (Clemson University) seeking AI Engineer/ML Engineer/Data Scientist roles. Skilled across the full ML pipeline — from data preprocessing and model development to evaluation and deployment using Python and modern ML frameworks.",
  metadataBase: new URL("https://github.com/Skywalker1910/Tech-Portfolio"), // GitHub repository URL
  openGraph: {
    title: "Aditya More — AI Engineer & ML Engineer",
    description: "CS graduate with expertise in machine learning, data analytics, AI security research, and Python-based ML pipelines.",
    type: "website"
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded">
          Skip to content
        </a>
        {process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" && <GhPagesBanner />}
        <BackgroundManager />
        <Navbar />
        <main id="main" className="flex-1 pt-24">{children}</main>
        <Footer />
        <ChatWidget hideButton />
        <CustomCursor />
        <script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem('theme');if(['dark','light','batman','clemson'].includes(t)){document.documentElement.classList.add(t)}else{document.documentElement.classList.add('dark')}}catch{document.documentElement.classList.add('dark')}`}} />
      </body>
    </html>
  );
}
