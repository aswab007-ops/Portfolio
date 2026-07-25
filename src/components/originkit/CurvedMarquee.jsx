import React, { useEffect, useId, useRef } from "react";

// Adapted from OriginKit's Curved Marquee component.
export default function CurvedMarquee({
  text,
  color = "currentColor",
  velocity = 18,
  curve = 82,
}) {
  const pathId = useId().replace(/:/g, "");
  const textRef = useRef(null);

  useEffect(() => {
    const textPath = textRef.current;
    if (!textPath || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let offset = 0;
    let previous = performance.now();
    const tick = (now) => {
      offset -= ((now - previous) / 1000) * velocity;
      previous = now;
      if (offset < -100) offset += 100;
      textPath.setAttribute("startOffset", `${offset}%`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [velocity]);

  return (
    <div className="curved-marquee" aria-hidden="true">
      <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
        <path
          id={pathId}
          d={`M -160 175 Q 720 ${175 - curve} 1600 175`}
          fill="none"
        />
        <text fill={color}>
          <textPath ref={textRef} href={`#${pathId}`} startOffset="-12%">
            {`${text} ${text} ${text}`}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
