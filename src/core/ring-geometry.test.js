import { describe, expect, it } from "vitest";
import { computeRingStroke } from "./ring-geometry.js";

describe("computeRingStroke", () => {
  it("leaves the unused share of the circle unpainted", () => {
    const { circumference, dashOffset } = computeRingStroke(0.25, 10);
    expect(circumference).toBeCloseTo(62.83, 2);
    expect(dashOffset).toBeCloseTo(47.12, 2);
  });

  it("clamps the ratio between 0 and 1", () => {
    expect(computeRingStroke(-0.5, 10).dashOffset).toBeCloseTo(62.83, 2);
    expect(computeRingStroke(1.4, 10).dashOffset).toBe(0);
  });
});
