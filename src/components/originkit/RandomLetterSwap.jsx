import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const colors = ["#64b98d", "#d4ad6c", "#c96f74", "#e6e2da"];

function shuffledRanks(text) {
  const indexes = [...text].map((_, index) => index).filter((index) => text[index] !== " ");
  indexes.sort(() => Math.random() - 0.5);
  return Object.fromEntries(indexes.map((index, rank) => [index, rank]));
}

// Adapted from OriginKit's Random Letter Swap component.
export default function RandomLetterSwap({ text }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [ranks, setRanks] = useState(() => shuffledRanks(text));
  const words = text.split(" ");

  const enter = () => {
    setRanks(shuffledRanks(text));
    setActive(true);
  };

  return (
    <span
      className={`random-letter-swap${active ? " is-active" : ""}`}
      onMouseEnter={enter}
      onMouseLeave={() => setActive(false)}
    >
      <span className="random-letter-swap-sr">{text}</span>
      <span className="random-letter-swap-visible" aria-hidden="true">
        {words.map((word, wordIndex) => {
          const offset = words.slice(0, wordIndex).reduce((length, item) => length + item.length + 1, 0);
          return (
            <React.Fragment key={`${word}-${wordIndex}`}>
              <span className="random-letter-word">
                {[...word].map((letter, letterIndex) => {
                  const index = offset + letterIndex;
                  const rank = ranks[index] ?? 0;
                  const transition = reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.42, delay: rank * 0.025, ease: [0.16, 1, 0.3, 1] };

                  return (
                    <span className="random-letter-slot" key={`${letter}-${index}`}>
                      <motion.span
                        className="random-letter-primary"
                        animate={{ y: active && !reduceMotion ? "-100%" : "0%" }}
                        transition={transition}
                      >
                        {letter}
                      </motion.span>
                      <motion.span
                        className="random-letter-secondary"
                        animate={{ top: active && !reduceMotion ? "0%" : "100%" }}
                        style={{ color: colors[(rank + index) % colors.length] }}
                        transition={transition}
                      >
                        {letter}
                      </motion.span>
                    </span>
                  );
                })}
              </span>
              {wordIndex < words.length - 1 && " "}
            </React.Fragment>
          );
        })}
      </span>
    </span>
  );
}
