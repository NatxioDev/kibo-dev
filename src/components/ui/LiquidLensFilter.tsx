"use client";

import { useEffect } from "react";

// Only Chromium renders SVG filters inside backdrop-filter; elsewhere the
// declaration would drop the blur too, so the lens is opt-in via data-lens.
function supportsBackdropLens() {
  return "userAgentData" in navigator;
}

export function LiquidLensFilter() {
  useEffect(() => {
    if (supportsBackdropLens()) {
      document.documentElement.setAttribute("data-lens", "");
    }
  }, []);

  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <filter
        id="liquid-lens"
        x="0"
        y="0"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.006 0.01"
          numOctaves="2"
          seed="11"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="48"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
