import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, ImageSquare, UploadSimple } from "@phosphor-icons/react";
import { clamp, gradients, luminance } from "./imageProcessing";
import MeshTextHover from "./originkit/MeshTextHover";
import SpotlightText from "./originkit/SpotlightText";

const MODES = {
  original: { label: "Original", detail: "Unprocessed road image" },
  mask: { label: "Lane mask", detail: "White + yellow HSV filter" },
  edges: { label: "Road edges", detail: "Sobel + trapezoid ROI" },
  lanes: { label: "Lane fit", detail: "Perspective-aware regression" },
};

const SAMPLES = [
  { label: "Open highway", src: "/assets/lane-test7.jpg", mode: "lanes" },
  { label: "Mountain route", src: "/assets/lane-test2.jpg", mode: "edges" },
  { label: "Road curve", src: "/assets/lane-test1.jpg", mode: "mask" },
];

function laneMask(imageData) {
  const mask = new Uint8Array(imageData.width * imageData.height);
  const { data } = imageData;

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const saturation = max === 0 ? 0 : delta / max;
    let hue = 0;

    if (delta) {
      if (max === r) hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else hue = 60 * ((r - g) / delta + 4);
      if (hue < 0) hue += 360;
    }

    const value = max * 255;
    const yellow = hue >= 15 && hue <= 45 && saturation > 0.2 && value > 100;
    const white = saturation < 0.18 && value > 175;
    mask[p] = yellow || white ? 255 : 0;
  }

  return mask;
}

function inRoadRoi(x, y, width, height) {
  const top = height * 0.56;
  if (y < top) return false;
  const progress = (y - top) / (height - top);
  const halfWidth = width * (0.08 + progress * 0.37);
  return Math.abs(x - width / 2) <= halfWidth;
}

function percentile(values, ratio) {
  if (!values.length) return null;
  values.sort((a, b) => a - b);
  return values[Math.floor((values.length - 1) * ratio)];
}

function regress(points) {
  if (points.length < 4) return null;
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
      xy: sum.xy + point.x * point.y,
      yy: sum.yy + point.y * point.y,
    }),
    { x: 0, y: 0, xy: 0, yy: 0 },
  );
  const denominator = points.length * total.yy - total.y * total.y;
  if (!denominator) return null;
  const slope = (points.length * total.xy - total.x * total.y) / denominator;
  return { slope, intercept: (total.x - slope * total.y) / points.length };
}

export function findLaneLines(mask, strength, width, height) {
  const top = Math.floor(height * 0.56);
  const bands = 18;
  const left = [];
  const right = [];

  for (let band = 0; band < bands; band += 1) {
    const yStart = Math.floor(top + (height - top) * band / bands);
    const yEnd = Math.floor(top + (height - top) * (band + 1) / bands);
    const leftXs = [];
    const rightXs = [];

    for (let y = yStart; y < yEnd; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = y * width + x;
        if (!inRoadRoi(x, y, width, height) || !mask[index] || strength[index] < 55) continue;
        if (x < width / 2 - width * 0.015) leftXs.push(x);
        if (x > width / 2 + width * 0.015) rightXs.push(x);
      }
    }

    const y = (yStart + yEnd) / 2;
    const leftX = percentile(leftXs, 0.78);
    const rightX = percentile(rightXs, 0.22);
    if (leftX !== null) left.push({ x: leftX, y });
    if (rightX !== null) right.push({ x: rightX, y });
  }

  const leftLine = regress(left);
  const rightLine = regress(right);
  const validLeft = leftLine && leftLine.slope < -0.02 ? leftLine : null;
  const validRight = rightLine && rightLine.slope > 0.02 ? rightLine : null;
  return [validLeft, validRight];
}

function paintMask(imageData, mask) {
  const output = new ImageData(imageData.width, imageData.height);
  for (let p = 0, i = 0; p < mask.length; p += 1, i += 4) {
    const active = mask[p] / 255;
    output.data[i] = clamp(16 + active * 214);
    output.data[i + 1] = clamp(17 + active * 166);
    output.data[i + 2] = clamp(17 + active * 75);
    output.data[i + 3] = 255;
  }
  return output;
}

function paintRoadEdges(imageData, mask, strength) {
  const output = new ImageData(imageData.width, imageData.height);
  const { width, height } = imageData;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      const i = p * 4;
      const active = inRoadRoi(x, y, width, height) && mask[p] ? clamp((strength[p] - 35) * 2.1) : 0;
      output.data[i] = clamp(16 + active * 0.84);
      output.data[i + 1] = clamp(17 + active * 0.64);
      output.data[i + 2] = clamp(17 + active * 0.28);
      output.data[i + 3] = 255;
    }
  }
  return output;
}

function paintLanes(imageData, lines) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  const yTop = imageData.height * 0.58;
  const yBottom = imageData.height;
  const xAt = (line, y) => line.slope * y + line.intercept;

  if (lines[0] && lines[1]) {
    context.beginPath();
    context.moveTo(xAt(lines[0], yBottom), yBottom);
    context.lineTo(xAt(lines[0], yTop), yTop);
    context.lineTo(xAt(lines[1], yTop), yTop);
    context.lineTo(xAt(lines[1], yBottom), yBottom);
    context.closePath();
    context.fillStyle = "rgba(29, 91, 67, 0.28)";
    context.fill();
  }

  lines.filter(Boolean).forEach((line) => {
    context.beginPath();
    context.moveTo(xAt(line, yBottom), yBottom);
    context.lineTo(xAt(line, yTop), yTop);
    context.strokeStyle = "#101111";
    context.lineWidth = 16;
    context.stroke();
    context.strokeStyle = "#a6824a";
    context.lineWidth = 8;
    context.stroke();
    context.strokeStyle = "#e6e2da";
    context.lineWidth = 2;
    context.stroke();
  });

  return context.getImageData(0, 0, imageData.width, imageData.height);
}

function LaneInspector() {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const originalRef = useRef(null);
  const processedRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [mode, setMode] = useState("lanes");
  const [laneCount, setLaneCount] = useState(0);
  const [fileName, setFileName] = useState("Open highway");
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
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      const original = context.getImageData(0, 0, width, height);
      const mask = laneMask(original);
      const { strength } = gradients(luminance(original.data), width, height);
      const lines = findLaneLines(mask, strength, width, height);
      originalRef.current = original;
      processedRef.current = {
        original,
        mask: paintMask(original, mask),
        edges: paintRoadEdges(original, mask, strength),
        lanes: paintLanes(original, lines),
      };
      setLaneCount(lines.filter(Boolean).length);
      setFileName(name);
      setImageVersion((version) => version + 1);
    };
    image.src = source;
  }, []);

  useEffect(() => {
    processImage(SAMPLES[0].src, "Open highway");
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
    setMode("lanes");
    processImage(SAMPLES[0].src, "Open highway");
  };

  return (
    <section className="vision-project section" id="lane-inspector">
      <div className="vision-heading">
        <div>
          <p className="section-kicker">Interactive project</p>
          <h2><MeshTextHover>Find the road ahead.</MeshTextHover></h2>
        </div>
        <SpotlightText className="vision-description">
          Lane Detection isolates road markings, focuses on the drivable region,
          and estimates the lane boundaries directly in your browser.
        </SpotlightText>
      </div>

      <div className="vision-shell">
        <aside className="vision-controls" aria-label="Lane Detection controls">
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
          <div className="vision-drop-hint"><ImageSquare /> Drop a road image to inspect</div>
        </div>

        <div className="vision-readout" aria-live="polite">
          <span><strong>{laneCount}</strong> lane boundaries</span>
          <span><strong>3</strong> ready demos</span>
          <span><strong>Local</strong> on-device processing</span>
        </div>
      </div>
    </section>
  );
}

if (import.meta.env.DEV) {
  const width = 10;
  const height = 10;
  const mask = new Uint8Array(width * height);
  const strength = new Float32Array(width * height);
  for (let y = 6; y < height; y += 1) {
    const offset = y - 6;
    [[4 - offset, 5 + offset]].flat().forEach((x) => {
      if (x >= 0 && x < width) {
        mask[y * width + x] = 255;
        strength[y * width + x] = 255;
      }
    });
  }
  console.assert(findLaneLines(mask, strength, width, height).length === 2, "Lane detection returns two lane slots");
}

export default LaneInspector;
