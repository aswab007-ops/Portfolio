import React from "react";

export default function SweepText({ children, className = "" }) {
  return (
    <span className={`sweep-text${className ? ` ${className}` : ""}`}>
      <span className="sweep-text-base">{children}</span>
      <span className="sweep-text-hover" aria-hidden="true">{children}</span>
    </span>
  );
}
