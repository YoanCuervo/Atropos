import { describe, expect, it } from "vitest";
import { classifyUsageLevel } from "./usage-level.js";

describe("classifyUsageLevel", () => {
  it.each([
    [0, "comfortable"],
    [49.9, "comfortable"],
    [50, "warning"],
    [79.9, "warning"],
    [80, "critical"],
    [100, "critical"],
  ])("classifies %s%% as %s", (usedPercentage, usageLevel) => {
    expect(classifyUsageLevel(usedPercentage)).toBe(usageLevel);
  });
});
