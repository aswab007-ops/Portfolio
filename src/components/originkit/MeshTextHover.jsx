import React, { Fragment, useEffect, useRef } from "react";

// Adapted from OriginKit's Mesh Text Hover component.
const GRID_W = 48;
const GRID_H = 20;
const SPRING = 0.08;
const DAMPING = 0.9;
const STEP = 0.1;

const vertexShader = `#version 300 es
in vec2 aPos;
in vec2 aUv;
in vec2 aDisp;
out vec2 vUv;
out float vMag;
void main() {
  gl_Position = vec4(aPos + aDisp, 0.0, 1.0);
  vUv = aUv;
  vMag = length(aDisp);
}`;

const fragmentShader = `#version 300 es
precision highp float;
in vec2 vUv;
in float vMag;
out vec4 outColor;
uniform sampler2D uTex;
uniform vec3 uColorA;
uniform vec3 uColorB;
void main() {
  vec4 base = texture(uTex, vUv);
  float offset = 0.005 * clamp(vMag * 8.0, 0.0, 1.0);
  float a = texture(uTex, vUv + vec2(offset, 0.0)).a;
  float b = texture(uTex, vUv - vec2(offset, 0.0)).a;
  vec3 color = base.rgb * base.a;
  color += uColorA * max(0.0, a - base.a);
  color += uColorB * max(0.0, b - base.a);
  outColor = vec4(color, max(base.a, max(a, b)));
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertex, fragment) {
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function parseHex(value) {
  const hex = value.replace("#", "");
  return [
    Number.parseInt(hex.slice(0, 2), 16) / 255,
    Number.parseInt(hex.slice(2, 4), 16) / 255,
    Number.parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

export default function MeshTextHover({
  children,
  className = "",
  force = 1.8,
  colors = ["#a6824a", "#1d5b43", "#5d1e21"],
}) {
  const wrapperRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasRef = useRef(null);
  const text = String(children);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const source = sourceRef.current;
    const canvas = canvasRef.current;
    if (
      !wrapper ||
      !source ||
      !canvas ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    ) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = createProgram(gl, vertex, fragment);
    if (!program) return;

    const vertexCount = (GRID_W + 1) * (GRID_H + 1);
    const positions = new Float32Array(vertexCount * 2);
    const uvs = new Float32Array(vertexCount * 2);
    for (let row = 0; row <= GRID_H; row += 1) {
      for (let column = 0; column <= GRID_W; column += 1) {
        const index = row * (GRID_W + 1) + column;
        const u = column / GRID_W;
        const v = row / GRID_H;
        positions[index * 2] = u * 2 - 1;
        positions[index * 2 + 1] = 1 - v * 2;
        uvs[index * 2] = u;
        uvs[index * 2 + 1] = v;
      }
    }

    const indices = new Uint32Array(GRID_W * GRID_H * 6);
    let offset = 0;
    for (let row = 0; row < GRID_H; row += 1) {
      for (let column = 0; column < GRID_W; column += 1) {
        const topLeft = row * (GRID_W + 1) + column;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + GRID_W + 1;
        const bottomRight = bottomLeft + 1;
        indices.set([topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight], offset);
        offset += 6;
      }
    }

    const displacement = new Float32Array(vertexCount * 2);
    const velocity = new Float32Array(vertexCount * 2);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const addBuffer = (data, attribute, usage = gl.STATIC_DRAW) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const location = gl.getAttribLocation(program, attribute);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
      return buffer;
    };

    const positionBuffer = addBuffer(positions, "aPos");
    const uvBuffer = addBuffer(uvs, "aUv");
    const displacementBuffer = addBuffer(displacement, "aDisp", gl.DYNAMIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const cursor = { x: 99, y: 99, px: 99, py: 99, inside: false };
    const palette = colors.map(parseHex);
    let animationFrame = 0;
    let destroyed = false;

    const render = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
      const colorIndex = Math.floor(performance.now() / 650) % palette.length;
      const colorA = palette[colorIndex];
      const colorB = palette[(colorIndex + 1) % palette.length];
      gl.uniform3f(gl.getUniformLocation(program, "uColorA"), ...colorA);
      gl.uniform3f(gl.getUniformLocation(program, "uColorB"), ...colorB);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    };

    const drawTexture = () => {
      const rect = wrapper.getBoundingClientRect();
      const style = getComputedStyle(source);
      // Italic glyphs and mesh movement can extend beyond the DOM text box.
      const gutter = Math.ceil(Number.parseFloat(style.fontSize) * 0.4);
      const width = rect.width + gutter * 2;
      const height = rect.height + gutter * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.left = `${-gutter}px`;
      canvas.style.top = `${-gutter}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.max(2, Math.round(width * dpr));
      canvas.height = Math.max(2, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);

      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = canvas.width;
      textureCanvas.height = canvas.height;
      const context = textureCanvas.getContext("2d");
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = style.color;
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.textAlign = "left";
      context.textBaseline = "middle";
      if ("letterSpacing" in context) context.letterSpacing = style.letterSpacing;

      source.querySelectorAll("[data-mesh-word]").forEach((word) => {
        const wordRect = word.getBoundingClientRect();
        context.fillText(
          word.textContent,
          wordRect.left - rect.left + gutter,
          wordRect.top - rect.top + wordRect.height / 2 + gutter
        );
      });

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
      render();
      wrapper.classList.add("is-ready");
    };

    const tick = () => {
      cursor.px = cursor.px === 99 ? cursor.x : cursor.px;
      cursor.py = cursor.py === 99 ? cursor.y : cursor.py;
      const cursorVelocityX = cursor.x - cursor.px;
      const cursorVelocityY = cursor.y - cursor.py;
      cursor.px = cursor.x;
      cursor.py = cursor.y;
      let energy = 0;

      for (let index = 0; index < vertexCount; index += 1) {
        const pointer = index * 2;
        const dx = displacement[pointer];
        const dy = displacement[pointer + 1];
        const distanceX = cursor.x - (positions[pointer] + dx);
        const distanceY = cursor.y - (positions[pointer + 1] + dy);
        const proximity = Math.max(0, 1 / (1 + Math.hypot(distanceX, distanceY) / 0.05) - 0.1);
        let vx = velocity[pointer] + cursorVelocityX * force * proximity - dx * SPRING;
        let vy = velocity[pointer + 1] + cursorVelocityY * force * proximity - dy * SPRING;
        vx *= DAMPING;
        vy *= DAMPING;
        velocity[pointer] = vx;
        velocity[pointer + 1] = vy;
        displacement[pointer] = Math.max(-1, Math.min(1, dx + vx * STEP));
        displacement[pointer + 1] = Math.max(-1, Math.min(1, dy + vy * STEP));
        energy += Math.abs(vx) + Math.abs(vy) + Math.abs(dx) + Math.abs(dy);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, displacementBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, displacement);
      render();
      animationFrame = cursor.inside || energy > 0.002 ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
      if (!cursor.inside) {
        cursor.px = x;
        cursor.py = y;
      }
      cursor.inside = true;
      cursor.x = x;
      cursor.y = y;
      start();
    };

    const onLeave = () => {
      cursor.inside = false;
      cursor.x = 99;
      cursor.y = 99;
      cursor.px = 99;
      cursor.py = 99;
      start();
    };

    const resizeObserver = new ResizeObserver(drawTexture);
    resizeObserver.observe(wrapper);
    wrapper.addEventListener("pointermove", onMove);
    wrapper.addEventListener("pointerleave", onLeave);
    document.fonts.ready.then(() => {
      if (!destroyed) drawTexture();
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      wrapper.removeEventListener("pointermove", onMove);
      wrapper.removeEventListener("pointerleave", onLeave);
      wrapper.classList.remove("is-ready");
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(uvBuffer);
      gl.deleteBuffer(displacementBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [colors, force, text]);

  return (
    <span ref={wrapperRef} className={`mesh-text-hover ${className}`}>
      <span ref={sourceRef} className="mesh-text-source">
        {text.split(" ").map((word, index, words) => (
          <Fragment key={`${word}-${index}`}>
            <span data-mesh-word>{word}</span>
            {index < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </span>
      <canvas ref={canvasRef} className="mesh-text-canvas" aria-hidden="true" />
    </span>
  );
}
