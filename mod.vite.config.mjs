import { resolve } from "path";
import { defineConfig } from "vite";

/**
 * Bundles the Claude Code mod and the parts of `src/core` and `src/shared` it uses
 * into one hooks module, next to the plugin files copied from `src/mod/plugin`.
 * The mods runtime has no Node.js: `claude-code` is provided by Claude Code, and
 * the unused `node:path` import of `core/` must not survive the bundle.
 */
export default defineConfig({
  publicDir: resolve("src/mod/plugin"),
  esbuild: {
    jsx: "transform",
    jsxFactory: "h",
  },
  build: {
    outDir: "out/mod",
    emptyOutDir: true,
    target: "es2022",
    minify: false,
    lib: {
      entry: resolve("src/mod/register.jsx"),
      formats: ["es"],
      fileName: () => "hooks/register.js",
    },
    rollupOptions: {
      external: ["claude-code", /^node:/],
      treeshake: { moduleSideEffects: "no-external" },
    },
  },
});
