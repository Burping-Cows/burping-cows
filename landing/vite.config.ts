import { defineConfig } from "vite";

export default defineConfig({
  root: "landing",
  build: { outDir: "../dist", emptyOutDir: true },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
});
