import React from "react";

// Adapted from OriginKit's canvas-based Dust Text Reveal for responsive, wrapping copy.
const dust = Array.from({ length: 30 }, (_, index) => {
  const x = (index * 37 + 7) % 101;
  const y = (index * 61 + 13) % 101;
  const dx = ((index % 7) - 3) * 6;
  const dy = (((index * 3) % 9) - 4) * 5;
  return [`${x}%`, `${y}%`, `${dx}px`, `${dy}px`];
});

export default function DustTextReveal({ as: Tag = "span", children, className = "", delay = 0 }) {
  return (
    <Tag className={`dust-text-reveal ${className}`.trim()} style={{ "--dust-delay": `${delay}s` }}>
      <span className="dust-text-content">{children}</span>
      <span className="dust-text-particles" aria-hidden="true">
        {dust.map(([x, y, dx, dy], index) => (
          <i
            key={`${x}-${y}`}
            style={{ "--dust-x": x, "--dust-y": y, "--dust-dx": dx, "--dust-dy": dy, "--dust-i": index }}
          />
        ))}
      </span>
    </Tag>
  );
}
