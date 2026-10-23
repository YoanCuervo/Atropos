import { resolve } from "path";
import { defineConfig } from "vite";

/**
 * Bundles the status line and the parts of `src/core` it uses into a single file,
 * so the installer can ship it outside the asar archive.
 */
export default defineConfig({
  build: {
    ssr: resolve("src/statusline/index.js"),
    outDir: "out/statusline",
    emptyOutDir: true,
    target: "node22",
    minify: false,
    rollupOptions: {
      output: { format: "es", entryFileNames: "index.mjs" },
    },
  },
});
