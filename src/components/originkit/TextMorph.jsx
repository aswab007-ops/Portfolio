import React, { useId } from "react";

// Adapted from OriginKit's Text Morph.
export default function TextMorph({ words, className = "" }) {
  const id = useId().replace(/:/g, "");
  const entries = Array.isArray(words) ? words : String(words).split(/\r?\n|,/).filter(Boolean);
  const slot = 2.15;
  const cycle = entries.length * slot;
  const animationName = `text-morph-${id}`;
  const longest = entries.reduce((current, word) => (word.length > current.length ? word : current), "");

  return (
    <span className={`text-morph ${className}`}>
      <style>{`
        @keyframes ${animationName} {
          0% { opacity: 0; filter: blur(16px); transform: translate(-50%, -50%) scale(.88); }
          8% { opacity: 1; filter: blur(0); transform: translate(-50%, -50%) scale(1); }
          22% { opacity: 1; filter: blur(0); transform: translate(-50%, -50%) scale(1); }
          30%, 100% { opacity: 0; filter: blur(16px); transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
      <span className="text-morph-anchor" aria-hidden="true">{longest}</span>
      {entries.map((word, index) => (
        <span
          className="text-morph-word"
          key={`${word}-${index}`}
          style={{ animation: `${animationName} ${cycle}s ${index * slot}s infinite ease-in-out` }}
          aria-hidden={index !== 0}
        >
          {word}
        </span>
      ))}
      <span className="sr-only">Muhammad Aswab Khalil</span>
    </span>
  );
}
