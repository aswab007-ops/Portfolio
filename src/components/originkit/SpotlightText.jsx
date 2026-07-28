import React, { useRef, useState } from "react";

// Adapted from OriginKit's Spotlight Text.
export default function SpotlightText({ children, className = "" }) {
  const ref = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, active: false });

  const move = (event) => {
    const rect = ref.current.getBoundingClientRect();
    setSpotlight({ x: event.clientX - rect.left, y: event.clientY - rect.top, active: true });
  };

  return (
    <span
      ref={ref}
      className={`spotlight-text ${className}`}
      onPointerMove={move}
      onPointerEnter={move}
      onPointerLeave={() => setSpotlight((value) => ({ ...value, active: false }))}
    >
      <span className="spotlight-text-dim">{children}</span>
      <span
        className="spotlight-text-bright"
        aria-hidden="true"
        style={{
          "--spotlight-x": `${spotlight.x}px`,
          "--spotlight-y": `${spotlight.y}px`,
          "--spotlight-size": spotlight.active ? "150px" : "0px",
        }}
      >
        {children}
      </span>
    </span>
  );
}
