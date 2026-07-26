import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

const COLUMNS = 48;

// Adapted from OriginKit's Water Button component.
export default function WaterButton({ children, type = "button" }) {
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!button || !canvas || !context) return undefined;

    const displacement = new Float32Array(COLUMNS);
    const velocity = new Float32Array(COLUMNS);
    let width = 1;
    let height = 1;
    let frame = 0;
    let alive = true;
    let hovering = false;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const surface = height * 0.42;
      const water = context.createLinearGradient(0, 0, width, height);
      water.addColorStop(0, "#1d5b43");
      water.addColorStop(0.55, "#5d1e21");
      water.addColorStop(1, "#a6824a");

      context.beginPath();
      context.moveTo(0, surface + displacement[0]);
      for (let index = 1; index < COLUMNS; index += 1) {
        context.lineTo((index / (COLUMNS - 1)) * width, surface + displacement[index]);
      }
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fillStyle = water;
      context.fill();

      context.beginPath();
      context.moveTo(0, surface + displacement[0]);
      for (let index = 1; index < COLUMNS; index += 1) {
        context.lineTo((index / (COLUMNS - 1)) * width, surface + displacement[index]);
      }
      context.strokeStyle = "rgba(230, 226, 218, .78)";
      context.lineWidth = 1.25;
      context.stroke();
    };

    const resize = () => {
      const rect = button.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw();
    };

    const step = () => {
      let energy = 0;
      for (let index = 1; index < COLUMNS - 1; index += 1) {
        const spread = displacement[index - 1] + displacement[index + 1] - 2 * displacement[index];
        velocity[index] += spread * 0.14 - displacement[index] * 0.018;
        velocity[index] *= 0.93;
      }
      for (let index = 0; index < COLUMNS; index += 1) {
        displacement[index] += velocity[index];
        energy += Math.abs(displacement[index]) + Math.abs(velocity[index]);
      }
      draw();
      if (alive && (hovering || energy > 0.04)) frame = requestAnimationFrame(step);
      else frame = 0;
    };

    const wake = () => {
      if (!reduceMotion && !frame) frame = requestAnimationFrame(step);
    };

    const disturb = (clientX, force) => {
      const rect = button.getBoundingClientRect();
      const center = Math.round(((clientX - rect.left) / rect.width) * (COLUMNS - 1));
      for (let offset = -5; offset <= 5; offset += 1) {
        const index = center + offset;
        if (index <= 0 || index >= COLUMNS - 1) continue;
        velocity[index] += force * (1 - Math.abs(offset) / 6);
      }
      wake();
    };

    const enter = (event) => {
      hovering = true;
      disturb(event.clientX, 1.8);
    };
    const move = (event) => disturb(event.clientX, Math.max(-4, Math.min(4, event.movementX * 0.22)));
    const leave = () => {
      hovering = false;
      wake();
    };
    const press = (event) => disturb(event.clientX, 7);

    const observer = new ResizeObserver(resize);
    observer.observe(button);
    if (!reduceMotion) {
      button.addEventListener("mouseenter", enter);
      button.addEventListener("mousemove", move);
      button.addEventListener("mouseleave", leave);
      button.addEventListener("pointerdown", press);
    }
    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      button.removeEventListener("mouseenter", enter);
      button.removeEventListener("mousemove", move);
      button.removeEventListener("mouseleave", leave);
      button.removeEventListener("pointerdown", press);
    };
  }, [reduceMotion]);

  return (
    <motion.button
      className="water-button"
      ref={buttonRef}
      type={type}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <canvas className="water-button-canvas" ref={canvasRef} aria-hidden="true" />
      <span className="water-button-label">{children}</span>
    </motion.button>
  );
}
