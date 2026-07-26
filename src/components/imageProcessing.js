export const clamp = (value, min = 0, max = 255) => Math.max(min, Math.min(max, value));

export function luminance(data) {
  const gray = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return gray;
}

export function gradients(gray, width, height) {
  const strength = new Float32Array(gray.length);
  let edgeCount = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gx =
        -gray[i - width - 1] + gray[i - width + 1] -
        2 * gray[i - 1] + 2 * gray[i + 1] -
        gray[i + width - 1] + gray[i + width + 1];
      const gy =
        -gray[i - width - 1] - 2 * gray[i - width] - gray[i - width + 1] +
        gray[i + width - 1] + 2 * gray[i + width] + gray[i + width + 1];
      const value = Math.min(255, Math.hypot(gx, gy));
      strength[i] = value;
      if (value > 72) edgeCount += 1;
    }
  }

  return { strength, edgeCount };
}
