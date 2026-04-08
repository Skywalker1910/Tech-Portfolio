"use client";

import { Mail } from "lucide-react";

export default function EnvelopeCard() {
  return (
    <div className="pt-14"> {/* Space for letter to slide into */}
      <div
        className="relative bg-black w-[220px] group transition-all duration-700 aspect-video flex items-center justify-center rounded-lg"
      >
        {/* Letter content - slides up on hover */}
        <div
          className="transition-all flex flex-col items-center py-3 justify-start duration-300 group-hover:duration-1000 bg-[#f5ede0] w-full h-full absolute rounded-lg group-hover:-translate-y-14"
        >
          {/* Message at top */}
          <p className="px-4 text-[10px] text-zinc-700 leading-[1.5] text-center w-full font-medium">
            I reply faster than<br />
            my models converge.
          </p>
          {/* Divider */}
          <div className="w-12 h-px bg-orange-300/60 my-2" />
          {/* Subtext */}
          <p className="px-4 text-[8px] text-zinc-500 text-center">
            Let's build something cool.
          </p>
          {/* Signature */}
          <div className="mt-3 pt-1.5 px-4 w-full flex items-center justify-center">
            <span className="text-[8px] text-orange-500 font-semibold">— Aditya</span>
          </div>
        </div>

        {/* Wax seal - shrinks and fades on hover */}
        <button
          className="bg-orange-500/20 text-orange-400 w-9 aspect-square rounded-full z-40 text-[10px] flex items-center justify-center font-semibold [clip-path:polygon(50%_0%,_80%_10%,_100%_35%,_100%_70%,_80%_90%,_50%_100%,_20%_90%,_0%_70%,_0%_35%,_20%_10%)] group-hover:opacity-0 transition-all duration-1000 group-hover:scale-0 group-hover:rotate-180 border-2 border-orange-500/40"
        >
          <Mail size={14} />
        </button>

        {/* Top flap - collapses upward on hover */}
        <div
          className="tp transition-all duration-1000 group-hover:duration-100 bg-[#0f0f14] absolute w-full h-full rounded-t-lg [clip-path:polygon(50%_50%,_100%_0,_0_0)] group-hover:[clip-path:polygon(50%_0%,_100%_0,_0_0)]"
        />

        {/* Left flap */}
        <div
          className="lft transition-all duration-700 absolute w-full h-full bg-[#0a0a0f] [clip-path:polygon(50%_50%,_0_0,_0_100%)] rounded-l-lg"
        />

        {/* Right flap */}
        <div
          className="rgt transition-all duration-700 absolute w-full h-full bg-[#0f0f14] [clip-path:polygon(50%_50%,_100%_0,_100%_100%)] rounded-r-lg"
        />

        {/* Bottom flap */}
        <div
          className="btm transition-all duration-700 absolute w-full h-full bg-[#0a0a0f] [clip-path:polygon(50%_50%,_100%_100%,_0_100%)] rounded-b-lg"
        />

        {/* Border overlay */}
        <div className="absolute inset-0 rounded-lg border border-orange-500/25 pointer-events-none z-50" />
      </div>
    </div>
  );
}

