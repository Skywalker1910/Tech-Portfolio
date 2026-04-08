"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import "./styles/not-found.css";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background 404 text */}
      <div className="text_404">
        <span className="text_4041">4</span>
        <span className="text_4042">0</span>
        <span className="text_4043">4</span>
      </div>

      {/* Retro TV */}
      <div className="tv-wrapper">
        <div className="tv-main">
          {/* Antenna */}
          <div className="antenna">
            <div className="antenna_shadow"></div>
            <div className="a1"></div>
            <div className="a1d"></div>
            <div className="a2"></div>
            <div className="a2d"></div>
          </div>

          {/* TV Body */}
          <div className="tv">
            {/* Screen */}
            <div className="display_div">
              <div className="screen_out">
                <div className="screen">
                  <span className="notfound_text">PAGE NOT FOUND</span>
                </div>
              </div>
            </div>

            {/* Lines / Vents */}
            <div className="lines">
              <div className="line1"></div>
              <div className="line2"></div>
              <div className="line3"></div>
            </div>

            {/* Buttons Panel */}
            <div className="buttons_div">
              <div className="b1">
                <div className="b1-inner"></div>
              </div>
              <div className="b2"></div>
              <div className="speakers">
                <div className="g1">
                  <div className="g11"></div>
                  <div className="g12"></div>
                  <div className="g13"></div>
                </div>
                <div className="g"></div>
              </div>
            </div>
          </div>

          {/* Base / Stand */}
          <div className="bottom">
            <div className="base1"></div>
            <div className="base2"></div>
            <div className="base3"></div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 z-10">
        <Link
          href="/"
          className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
        >
          <Home size={16} />
          Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 text-sm font-medium transition-all"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-zinc-500 text-sm mt-6 text-center max-w-md z-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
    </div>
  );
}
