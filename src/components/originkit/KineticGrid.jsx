import React, { useEffect, useRef } from "react";

// Adapted from OriginKit's Kinetic Grid for this Vite/CSS project.
export default function KineticGrid({
  background = "#101111",
  dotColor = "#e6e2da",
  lineColor = "#a6824a",
  spacing = 34,
  radius = 220,
  strength = 4,
  className = "",
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!host || !canvas || !context) return undefined;

    let width = 1;
    let height = 1;
    let points = [];
    let columns = [];
    let frameId = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const gap = Math.max(12, spacing);
    const pull = (Math.max(1, Math.min(10, strength)) / 10) * 4;

    const build = () => {
      const rect = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = [];
      points = [];

      for (let column = 0; column < Math.floor(width / gap) + 2; column += 1) {
        const entries = [];
        for (let row = 0; row < Math.floor(height / gap) + 2; row += 1) {
          const point = { homeX: column * gap, homeY: row * gap, x: column * gap, y: row * gap, vx: 0, vy: 0 };
          entries.push(point);
          points.push(point);
        }
        columns.push(entries);
      }
    };

    const onMove = (event) => {
      const rect = host.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = mouse.x >= 0 && mouse.x <= rect.width && mouse.y >= 0 && mouse.y <= rect.height;
    };
    const onLeave = () => { mouse.active = false; };
    const resizeObserver = new ResizeObserver(build);
    resizeObserver.observe(host);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    build();

    const draw = () => {
      context.clearRect(0, 0, width, height);
      points.forEach((point) => {
        let ax = (point.homeX - point.x) * 0.08;
        let ay = (point.homeY - point.y) * 0.08;
        if (mouse.active) {
          const dx = mouse.x - point.x;
          const dy = mouse.y - point.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius && distance > 0.001) {
            const force = (1 - distance / radius) * pull;
            ax += (dx / distance) * force;
            ay += (dy / distance) * force;
          }
        }
        point.vx = (point.vx + ax) * 0.82;
        point.vy = (point.vy + ay) * 0.82;
        point.x += point.vx;
        point.y += point.vy;
      });

      columns.forEach((column, columnIndex) => {
        column.forEach((point, rowIndex) => {
          const proximity = mouse.active ? Math.max(0, 1 - Math.hypot(mouse.x - point.x, mouse.y - point.y) / radius) : 0;
          context.globalAlpha = 0.055 + proximity * 0.55;
          context.strokeStyle = lineColor;
          context.lineWidth = 0.55 + proximity * 1.15;
          [columns[columnIndex + 1]?.[rowIndex], column[rowIndex + 1]].filter(Boolean).forEach((next) => {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          });
          context.globalAlpha = 0.22 + proximity * 0.72;
          context.fillStyle = dotColor;
          context.beginPath();
          context.arc(point.x, point.y, 0.8 + proximity * 1.6, 0, Math.PI * 2);
          context.fill();
        });
      });
      context.globalAlpha = 1;
      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [dotColor, lineColor, radius, spacing, strength]);

  return (
    <div ref={hostRef} className={`kinetic-grid-bg ${className}`} style={{ background }} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
