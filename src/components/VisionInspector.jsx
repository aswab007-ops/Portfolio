import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, ImageSquare, UploadSimple } from "@phosphor-icons/react";
import { clamp, gradients, luminance } from "./imageProcessing";

const MODES = {
  original: { label: "Original", detail: "Unprocessed source image" },
  edges: { label: "Edges", detail: "Sobel structure map" },
  features: { label: "Features", detail: "Gradient response" },
  regions: { label: "Regions", detail: "Color clustering" },
};

const SAMPLES = [
  { label: "Architecture", src: "/assets/vision-architecture.jpg", mode: "edges" },
  { label: "Mechanics", src: "/assets/vision-gears.jpg", mode: "features" },
  { label: "Color market", src: "/assets/vision-produce.jpg", mode: "regions" },
];


function paintEdges(imageData, strength) {
  const output = new ImageData(imageData.width, imageData.height);
  for (let p = 0, i = 0; p < strength.length; p += 1, i += 4) {
    const value = strength[p];
    const glow = clamp((value - 34) * 1.45);
    output.data[i] = clamp(16 + glow * 0.9);
    output.data[i + 1] = clamp(17 + glow * 0.58);
    output.data[i + 2] = clamp(17 + glow * 0.23);
    output.data[i + 3] = 255;
  }
  return output;
}

function paintFeatures(imageData, strength) {
  const output = new ImageData(imageData.width, imageData.height);
  for (let p = 0, i = 0; p < strength.length; p += 1, i += 4) {
    const t = strength[p] / 255;
    const green = [21, 66, 48];
    const burgundy = [93, 30, 33];
    const gold = [166, 130, 74];
    const from = t < 0.5 ? green : burgundy;
    const to = t < 0.5 ? burgundy : gold;
    const mix = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    output.data[i] = from[0] + (to[0] - from[0]) * mix;
    output.data[i + 1] = from[1] + (to[1] - from[1]) * mix;
    output.data[i + 2] = from[2] + (to[2] - from[2]) * mix;
    output.data[i + 3] = 255;
  }
  return output;
}

function paintRegions(imageData) {
  const { data, width, height } = imageData;
  const centers = [
    [16, 17, 17],
    [21, 66, 48],
    [93, 30, 33],
    [166, 130, 74],
    [230, 226, 218],
  ];

  for (let pass = 0; pass < 4; pass += 1) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < data.length; i += 32) {
      let closest = 0;
      let distance = Infinity;
      for (let c = 0; c < centers.length; c += 1) {
        const dr = data[i] - centers[c][0];
        const dg = data[i + 1] - centers[c][1];
        const db = data[i + 2] - centers[c][2];
        const next = dr * dr + dg * dg + db * db;
        if (next < distance) {
          distance = next;
          closest = c;
        }
      }
      sums[closest][0] += data[i];
      sums[closest][1] += data[i + 1];
      sums[closest][2] += data[i + 2];
      sums[closest][3] += 1;
    }
    sums.forEach((sum, index) => {
      if (sum[3]) centers[index] = sum.slice(0, 3).map((value) => value / sum[3]);
    });
  }

  const output = new ImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    let closest = 0;
    let distance = Infinity;
    for (let c = 0; c < centers.length; c += 1) {
      const dr = data[i] - centers[c][0];
      const dg = data[i + 1] - centers[c][1];
      const db = data[i + 2] - centers[c][2];
      const next = dr * dr + dg * dg + db * db;
      if (next < distance) {
        distance = next;
        closest = c;
      }
    }
    output.data[i] = centers[closest][0];
    output.data[i + 1] = centers[closest][1];
    output.data[i + 2] = centers[closest][2];
    output.data[i + 3] = 255;
  }
  return output;
}

function VisionInspector() {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const originalRef = useRef(null);
  const processedRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [mode, setMode] = useState("edges");
  const [edgeCount, setEdgeCount] = useState(0);
  const [fileName, setFileName] = useState("Architecture");
  const [isDragging, setIsDragging] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const original = originalRef.current;
    const processed = processedRef.current;
    if (!canvas || !original || !processed) return;
    const context = canvas.getContext("2d");
    context.putImageData(processed[mode], 0, 0);
  }, [mode]);

  const processImage = useCallback((source, name) => {
    const image = new Image();
    image.onload = () => {
      const width = 1100;
      const height = 680;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      const original = context.getImageData(0, 0, width, height);
      const { strength, edgeCount: count } = gradients(luminance(original.data), width, height);
      originalRef.current = original;
      processedRef.current = {
        original,
        edges: paintEdges(original, strength),
        features: paintFeatures(original, strength),
        regions: paintRegions(original),
      };
      setEdgeCount(count);
      setFileName(name);
      setImageVersion((version) => version + 1);
    };
    image.src = source;
  }, []);

  useEffect(() => {
    processImage(SAMPLES[0].src, "Architecture");
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [processImage]);

  useEffect(() => {
    draw();
  }, [draw, imageVersion]);

  const useFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    processImage(objectUrlRef.current, file.name);
  };

  const reset = () => {
    setMode("edges");
    processImage(SAMPLES[0].src, "Architecture");
  };

  return (
    <section className="vision-project section" id="vision-inspector">
      <div className="vision-heading">
        <div>
          <p className="section-kicker">Interactive project</p>
          <h2>See what an algorithm sees.</h2>
        </div>
        <p>
          Vision Inspector turns any image into a live computer-vision study.
          Reveal structure, feature response, and color regions directly in your browser.
        </p>
      </div>

      <div className="vision-shell">
        <aside className="vision-controls" aria-label="Vision Inspector controls">
          <div>
            <span className="vision-label">Quick demos</span>
            <div className="vision-samples">
              {SAMPLES.map((sample) => (
                <button
                  type="button"
                  onClick={() => {
                    setMode(sample.mode);
                    processImage(sample.src, sample.label);
                  }}
                  key={sample.label}
                >
                  <img src={sample.src} alt="" />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="vision-label">Analysis</span>
            <div className="vision-modes">
              {Object.entries(MODES).map(([key, item]) => (
                <button
                  type="button"
                  className={mode === key ? "is-active" : ""}
                  onClick={() => setMode(key)}
                  aria-pressed={mode === key}
                  key={key}
                >
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="vision-upload">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(event) => useFile(event.target.files?.[0])}
              tabIndex={-1}
              aria-hidden="true"
            />
            <button type="button" className="vision-upload-button" onClick={() => inputRef.current?.click()}>
              <UploadSimple /> Try your image
            </button>
            <button type="button" className="vision-reset" onClick={reset}>
              <ArrowCounterClockwise /> Reset sample
            </button>
          </div>
        </aside>

        <div
          className={`vision-stage ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            useFile(event.dataTransfer.files?.[0]);
          }}
        >
          <canvas ref={canvasRef} aria-label={`${MODES[mode].label} analysis of ${fileName}`} />
          <span className="vision-analysis-label">{MODES[mode].label}</span>
          <div className="vision-drop-hint"><ImageSquare /> Drop an image to inspect</div>
        </div>

        <div className="vision-readout" aria-live="polite">
          <span><strong>{edgeCount.toLocaleString()}</strong> structural points</span>
          <span><strong>3</strong> ready demos</span>
          <span><strong>Local</strong> on-device processing</span>
        </div>
      </div>
    </section>
  );
}

if (import.meta.env.DEV) {
  const check = gradients(new Float32Array(9), 3, 3);
  console.assert(check.strength.length === 9, "Vision gradient output must match input size");
}

export default VisionInspector;
