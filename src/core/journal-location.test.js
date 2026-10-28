import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildJournalPath,
  buildLegacyJournalPath,
  buildSharedFolderPath,
} from "./journal-location.js";

const homePath = join("C:", "Users", "someone");

describe("buildSharedFolderPath", () => {
  it("places the shared folder in the home folder, outside AppData", () => {
    expect(buildSharedFolderPath(homePath)).toBe(join(homePath, ".atropos"));
  });
});

describe("buildJournalPath", () => {
  it("places the journal in the shared folder", () => {
    expect(buildJournalPath(homePath)).toBe(
      join(homePath, ".atropos", "limit-snapshots.jsonl"),
    );
  });
});

describe("buildLegacyJournalPath", () => {
  it("places the old journal in the Atropos folder of the application data", () => {
    const applicationDataPath = join(homePath, "AppData", "Roaming");

    expect(buildLegacyJournalPath(applicationDataPath)).toBe(
      join(applicationDataPath, "Atropos", "limit-snapshots.jsonl"),
    );
  });
});
