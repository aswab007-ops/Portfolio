import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, GithubLogo } from "@phosphor-icons/react";
import "@fontsource/dm-sans/300.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/playfair-display/500-italic.css";
import CursorGrid from "./components/reactbits/CursorGrid/CursorGrid";
import LaneInspector from "./components/LaneInspector";
import "./styles.css";

const colors = ["#1d5b43", "#a6824a", "#5d1e21", "#e6e2da"];

function LanePage() {
  return (
    <>
      <CursorGrid
        className="cursor-grid-bg"
        cellSize={30}
        colors={colors}
        radius={150}
        lineWidth={1}
        maxOpacity={0.8}
        fillOpacity={0.045}
        gridOpacity={0.05}
        cellRadius={3}
        clickPulse={false}
      />
      <main className="vision-page">
        <header className="vision-page-header">
          <a className="underline-link" href="/"><ArrowLeft /> Back to portfolio</a>
          <span>Muhammad Aswab Khalil</span>
          <a
            href="https://github.com/aswab007-ops/lane-detection"
            target="_blank"
            rel="noreferrer"
            aria-label="Lane Detection source on GitHub"
          >
            <GithubLogo />
          </a>
        </header>
        <LaneInspector />
        <p className="vision-page-note">
          <span>Built with React, the Canvas API, HSV filtering, gradient analysis, ROI selection, and lane regression. Images never leave your browser.</span>
          <span>Demo road images come from the project’s own test set.</span>
        </p>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanePage />
  </React.StrictMode>,
);
