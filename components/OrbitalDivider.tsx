"use client";

/*
  Planet horizon divider — mimics a glowing atmospheric limb as seen from orbit.
  Teal glow on the left, bright white at center, violet on the right.
  Pure SVG, no animation library required.

  Ellipse maths:
    cx=720, cy=640, rx=980, ry=530
    → apex at y = 640-530 = 110  (upper quarter of 280px SVG)
    → edges at y ≈ 280            (exactly at SVG bottom)
*/

const CX = 720;
const CY = 640;
const RX = 980;
const RY = 530;

export default function OrbitalDivider() {
  return (
    <div
      className="absolute bottom-0 left-0 w-full pointer-events-none overflow-hidden"
      style={{ height: "clamp(120px, 18vw, 280px)", zIndex: 2 }}
    >
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/*
            gradientUnits="userSpaceOnUse" pins the gradient to SVG pixel coords
            so it always spans the full width regardless of viewport scaling.
          */}

          {/* Wide atmospheric corona — outermost, heaviest blur */}
          <linearGradient id="ph-atmo-wide" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0"    />
            <stop offset="8%"   stopColor="#0d9488" stopOpacity="0.35" />
            <stop offset="24%"  stopColor="#22d3ee" stopOpacity="0.50" />
            <stop offset="44%"  stopColor="#e0f2fe" stopOpacity="0.55" />
            <stop offset="56%"  stopColor="#e9d5ff" stopOpacity="0.50" />
            <stop offset="74%"  stopColor="#7c3aed" stopOpacity="0.38" />
            <stop offset="90%"  stopColor="#3b0764" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0"    />
          </linearGradient>

          {/* Mid glow band */}
          <linearGradient id="ph-atmo-mid" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0"    />
            <stop offset="6%"   stopColor="#0d9488" stopOpacity="0.55" />
            <stop offset="22%"  stopColor="#22d3ee" stopOpacity="0.78" />
            <stop offset="40%"  stopColor="#f0f9ff" stopOpacity="0.88" />
            <stop offset="52%"  stopColor="#f5f3ff" stopOpacity="0.85" />
            <stop offset="70%"  stopColor="#8b5cf6" stopOpacity="0.70" />
            <stop offset="88%"  stopColor="#4c1d95" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0"    />
          </linearGradient>

          {/* Crisp bright limb line */}
          <linearGradient id="ph-limb" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0"    />
            <stop offset="5%"   stopColor="#2dd4bf" stopOpacity="0.70" />
            <stop offset="20%"  stopColor="#7dd3fc" stopOpacity="0.90" />
            <stop offset="36%"  stopColor="#ffffff" stopOpacity="1.00" />
            <stop offset="50%"  stopColor="#e0e7ff" stopOpacity="1.00" />
            <stop offset="66%"  stopColor="#a78bfa" stopOpacity="0.92" />
            <stop offset="82%"  stopColor="#6d28d9" stopOpacity="0.60" />
            <stop offset="94%"  stopColor="#3b0764" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0"    />
          </linearGradient>

          {/* Planet body fill — removed so background animation shows through */}

          {/* Blur filters */}
          <filter id="ph-blur-wide" x="-4%" y="-600%" width="108%" height="1400%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="ph-blur-mid" x="-3%" y="-400%" width="106%" height="900%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="ph-blur-limb" x="-2%" y="-500%" width="104%" height="1100%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Planet body removed — background animation visible through the arc */}

        {/* 2. Wide atmospheric corona */}
        <ellipse
          cx={CX} cy={CY} rx={RX} ry={RY}
          fill="none"
          stroke="url(#ph-atmo-wide)"
          strokeWidth="90"
          filter="url(#ph-blur-wide)"
          opacity="0.80"
        />

        {/* 3. Mid glow */}
        <ellipse
          cx={CX} cy={CY} rx={RX} ry={RY}
          fill="none"
          stroke="url(#ph-atmo-mid)"
          strokeWidth="28"
          filter="url(#ph-blur-mid)"
          opacity="0.90"
        />

        {/* 4. Crisp limb line */}
        <ellipse
          cx={CX} cy={CY} rx={RX} ry={RY}
          fill="none"
          stroke="url(#ph-limb)"
          strokeWidth="1.8"
          filter="url(#ph-blur-limb)"
        />

        {/* 5. Faint stars above the arc */}
        {([
          [110, 22, 0.9], [255, 44, 0.7], [398, 18, 1.0], [512, 58, 0.6],
          [665, 12, 0.8], [720,  6, 0.5], [840, 52, 0.7], [955, 30, 0.9],
          [1080,16, 0.6], [1200,48, 0.8], [1340,24, 0.7], [1420,40, 0.5],
        ] as [number, number, number][]).map(([sx, sy, op], i) => (
          <circle key={i} cx={sx} cy={sy} r={0.7 + (i % 3) * 0.35} fill="#c4b5fd" opacity={op * 0.22} />
        ))}
      </svg>
    </div>
  );
}
