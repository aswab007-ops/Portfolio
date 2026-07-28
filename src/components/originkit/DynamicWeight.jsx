import React, { useEffect, useRef } from "react";
import { useAnimationFrame, useReducedMotion } from "motion/react";

const MAX_REACH = 800;

// Adapted from OriginKit's Dynamic Weight component.
export default function DynamicWeight({
  children,
  fromWeight = 420,
  toWeight = 850,
  strength = 22,
  className = "",
}) {
  const containerRef = useRef(null);
  const letterRefs = useRef([]);
  const factorsRef = useRef([]);
  const lastFrameRef = useRef(0);
  const pointerRef = useRef({ x: -99999, y: -99999 });
  const reduceMotion = useReducedMotion();
  const label = String(children);
  const reach = Math.max(1, Math.min(100, strength) / 100 * MAX_REACH);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const update = (event) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    window.addEventListener("pointermove", update, { passive: true });
    return () => window.removeEventListener("pointermove", update);
  }, [reduceMotion]);

  useAnimationFrame((now) => {
    if (reduceMotion || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const previous = lastFrameRef.current || now;
    const smoothing = 1 - Math.exp(-Math.min(0.1, (now - previous) / 1000) / 0.22);
    lastFrameRef.current = now;

    letterRefs.current.forEach((letter, index) => {
      if (!letter) return;
      const rect = letter.getBoundingClientRect();
      const distance = Math.hypot(
        pointerRef.current.x - (rect.left + rect.width / 2 - containerRect.left),
        pointerRef.current.y - (rect.top + rect.height / 2 - containerRect.top),
      );
      const target = Math.max(0, 1 - distance / reach);
      const factor = (factorsRef.current[index] ?? 0) + (target - (factorsRef.current[index] ?? 0)) * smoothing;
      factorsRef.current[index] = factor;
      letter.style.fontVariationSettings = `'wght' ${Math.round(fromWeight + (toWeight - fromWeight) * factor)}`;
    });
  });

  letterRefs.current = [];
  let letterIndex = 0;

  return (
    <span ref={containerRef} className={`dynamic-weight ${className}`}>
      <span className="sr-only">{label}</span>
      {label.split(" ").map((word, wordIndex, words) => (
        <React.Fragment key={`${word}-${wordIndex}`}>
          <span className="dynamic-weight-word" aria-hidden="true">
            {word.split("").map((letter) => {
              const index = letterIndex;
              letterIndex += 1;
              return (
                <span
                  className="dynamic-weight-letter"
                  key={`${letter}-${index}`}
                  ref={(element) => { letterRefs.current[index] = element; }}
                  style={{ fontVariationSettings: `'wght' ${fromWeight}` }}
                >
                  {letter}
                </span>
              );
            })}
          </span>
          {wordIndex < words.length - 1 && <span aria-hidden="true">&nbsp;</span>}
        </React.Fragment>
      ))}
    </span>
  );
}
