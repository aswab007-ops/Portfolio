import React, { useEffect, useRef } from "react";

// Adapted from Originkit's Liquid Distortion component for theme-colored card surfaces.
export default function LiquidDistortion({ seed = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!canvas || !host || !gl) return;

    const vertexSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = position * .5 + .5;
        gl_Position = vec4(position, 0., 1.);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      varying vec2 uv;
      uniform vec2 pointer;
      uniform vec2 velocity;
      uniform float energy;
      uniform float time;
      uniform float seed;

      void main() {
        vec2 p = uv - pointer;
        p.x *= 3.6;
        float distanceToPointer = length(p);
        float wave = sin(distanceToPointer * 30. - time * 6. + seed) * exp(-distanceToPointer * 3.8);
        vec2 direction = normalize(p + .0001);
        vec2 distorted = uv + direction * wave * energy * .075 + velocity * energy * .018;
        float field = sin(distorted.x * 9. + distorted.y * 6. + time + seed);
        float glow = exp(-distanceToPointer * 3.2) * energy;

        vec3 emerald = vec3(.11, .50, .32);
        vec3 gold = vec3(.82, .62, .28);
        vec3 burgundy = vec3(.55, .12, .16);
        vec3 color = mix(emerald, gold, smoothstep(-.8, .8, field));
        color = mix(color, burgundy, smoothstep(.35, 1., wave + glow * .35) * .42);
        float alpha = min((.08 + glow * .62 + abs(wave) * .3) * energy, .88);
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      pointer: gl.getUniformLocation(program, "pointer"),
      velocity: gl.getUniformLocation(program, "velocity"),
      energy: gl.getUniformLocation(program, "energy"),
      time: gl.getUniformLocation(program, "time"),
      seed: gl.getUniformLocation(program, "seed"),
    };
    const state = {
      pointer: [0.5, 0.5],
      previous: [0.5, 0.5],
      velocity: [0, 0],
      energy: 0,
      target: 0,
      frame: 0,
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (timestamp = 0) => {
      state.energy += (state.target - state.energy) * 0.09;
      state.velocity[0] *= 0.9;
      state.velocity[1] *= 0.9;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2fv(uniforms.pointer, state.pointer);
      gl.uniform2fv(uniforms.velocity, state.velocity);
      gl.uniform1f(uniforms.energy, state.energy);
      gl.uniform1f(uniforms.time, timestamp * 0.001);
      gl.uniform1f(uniforms.seed, seed * 1.71);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (state.target > 0 || state.energy > 0.01) {
        state.frame = requestAnimationFrame(draw);
      } else {
        state.frame = 0;
      }
    };

    const start = () => {
      if (reducedMotion) return;
      state.target = 1;
      if (!state.frame) state.frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      if (reducedMotion) return;
      const rect = host.getBoundingClientRect();
      const next = [
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      ];
      state.velocity = [next[0] - state.previous[0], next[1] - state.previous[1]];
      state.previous = next;
      state.pointer = next;
      start();
    };
    const leave = () => {
      state.target = 0;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener("pointerenter", start);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(state.frame);
      observer.disconnect();
      host.removeEventListener("pointerenter", start);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, [seed]);

  return <canvas className="project-liquid-distortion" ref={canvasRef} aria-hidden="true" />;
}
