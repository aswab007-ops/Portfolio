import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        portfolio: resolve(import.meta.dirname, "index.html"),
        lane: resolve(import.meta.dirname, "lane.html"),
        vision: resolve(import.meta.dirname, "vision.html"),
      },
    },
  },
});
