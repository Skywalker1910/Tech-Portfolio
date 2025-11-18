import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Aditya More — Data Science & ML Engineering",
  description: "Graduate student in Computer Science (Data Science & Informatics) seeking Data Scientist/ML Engineer roles. Experience in Python, ML, and scalable course development.",
  metadataBase: new URL("https://github.com/Skywalker1910/Tech-Portfolio"), // GitHub repository URL
  openGraph: {
    title: "Aditya More — Data Science & ML Engineering",
    description: "Graduate student with experience in machine learning, data analytics, and educational technology.",
    type: "website"
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen flex flex-col font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem('theme');if(['dark','light','batman','clemson'].includes(t)){if(t!=='light'){document.documentElement.classList.add(t)}}else{document.documentElement.classList.add('dark')}}catch{document.documentElement.classList.add('dark')}`}} />
      </body>
    </html>
  );
}
