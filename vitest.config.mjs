import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/core/**/*.test.js", "src/shared/**/*.test.js"],
    environment: "node",
  },
});
