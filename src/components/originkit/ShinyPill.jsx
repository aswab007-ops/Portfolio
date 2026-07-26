import React from "react";

// Adapted from OriginKit's Shiny Pill component for readable, wrapping body copy.
export default function ShinyPill({ children }) {
  return (
    <span className="shiny-pill">
      <span className="shiny-pill-base">{children}</span>
      <span className="shiny-pill-shine shiny-pill-emerald" aria-hidden="true">{children}</span>
      <span className="shiny-pill-shine shiny-pill-gold" aria-hidden="true">{children}</span>
      <span className="shiny-pill-shine shiny-pill-burgundy" aria-hidden="true">{children}</span>
    </span>
  );
}
