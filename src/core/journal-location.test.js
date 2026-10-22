import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildJournalPath } from "./journal-location.js";

describe("buildJournalPath", () => {
  it("places the journal in the Atropos folder of the application data", () => {
    const applicationDataPath = join(
      "C:",
      "Users",
      "someone",
      "AppData",
      "Roaming",
    );

    expect(buildJournalPath(applicationDataPath)).toBe(
      join(applicationDataPath, "Atropos", "limit-snapshots.jsonl"),
    );
  });
});
