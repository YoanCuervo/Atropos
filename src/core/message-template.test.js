import { describe, expect, it } from "vitest";
import { MissingTemplateValueError } from "./errors.js";
import { fillMessageTemplate } from "./message-template.js";

describe("fillMessageTemplate", () => {
  it("replaces every placeholder with its value", () => {
    expect(
      fillMessageTemplate("{percentage}% used, resets {time}", {
        percentage: 42,
        time: "17:00",
      }),
    ).toBe("42% used, resets 17:00");
  });

  it("returns a message without placeholders unchanged", () => {
    expect(fillMessageTemplate("Loading limits…")).toBe("Loading limits…");
  });

  it("fails when a placeholder has no value", () => {
    expect(() => fillMessageTemplate("Resets {time}", {})).toThrow(
      MissingTemplateValueError,
    );
  });
});
