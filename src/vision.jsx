import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft } from "@phosphor-icons/react";
import "@fontsource/dm-sans/300.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/playfair-display/500-italic.css";
import KineticGrid from "./components/originkit/KineticGrid";
import TextMorph from "./components/originkit/TextMorph";
import GithubButton from "./components/GithubButton";
import VisionInspector from "./components/VisionInspector";
import "./styles.css";

function VisionPage() {
  return (
    <>
      <KineticGrid />
      <main className="vision-page">
        <header className="vision-page-header">
          <a className="underline-link" href="/"><ArrowLeft /> Back to portfolio</a>
          <TextMorph
            className="vision-name-morph"
            words={["Muhammad", "Aswab", "Khalil", "Muhammad Aswab Khalil"]}
          />
          <GithubButton
            href="https://github.com/aswab007-ops/canny-edge-detector"
            label="Custom Canny Edge Detector source on GitHub"
          />
        </header>
        <VisionInspector />
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <VisionPage />
  </React.StrictMode>,
);
