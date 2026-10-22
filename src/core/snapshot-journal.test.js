import { describe, expect, it } from "vitest";
import { InvalidJournalLineError } from "./errors.js";
import {
  createLimitSnapshots,
  formatJournalLine,
  parseJournalLine,
} from "./snapshot-journal.js";

const SLOT_START_MS = Date.UTC(2026, 9, 22, 14, 6, 0, 0);
const FIVE_HOUR_RESETS_AT_MS = Date.UTC(2026, 9, 22, 17, 0, 0, 0);
const SEVEN_DAY_RESETS_AT_MS = Date.UTC(2026, 9, 27, 8, 0, 0, 0);

function createRateLimits() {
  return {
    fiveHour: {
      windowKind: "five_hour",
      usedPercentage: 42,
      resetsAtMs: FIVE_HOUR_RESETS_AT_MS,
    },
    sevenDay: {
      windowKind: "seven_day",
      usedPercentage: 67,
      resetsAtMs: SEVEN_DAY_RESETS_AT_MS,
    },
  };
}

function createSevenDaySnapshot() {
  return {
    slotStartedAt: "2026-10-22T14:06:00.000Z",
    windowKind: "seven_day",
    usedPercentage: 67,
    resetsAt: "2026-10-27T08:00:00.000Z",
  };
}

describe("createLimitSnapshots", () => {
  it("creates one snapshot per window, dated with the slot start", () => {
    expect(createLimitSnapshots(createRateLimits(), SLOT_START_MS)).toEqual([
      {
        slotStartedAt: "2026-10-22T14:06:00.000Z",
        windowKind: "five_hour",
        usedPercentage: 42,
        resetsAt: "2026-10-22T17:00:00.000Z",
      },
      createSevenDaySnapshot(),
    ]);
  });

  it("skips a window that is missing", () => {
    const rateLimits = { ...createRateLimits(), fiveHour: null };

    expect(createLimitSnapshots(rateLimits, SLOT_START_MS)).toEqual([
      createSevenDaySnapshot(),
    ]);
  });

  it("returns no snapshot when both windows are missing", () => {
    const rateLimits = { fiveHour: null, sevenDay: null };

    expect(createLimitSnapshots(rateLimits, SLOT_START_MS)).toEqual([]);
  });
});

describe("formatJournalLine", () => {
  it("writes the line format defined in the scoping document", () => {
    expect(formatJournalLine(createSevenDaySnapshot())).toBe(
      '{"slotStartedAt":"2026-10-22T14:06:00.000Z","windowKind":"seven_day","usedPercentage":67,"resetsAt":"2026-10-27T08:00:00.000Z"}\n',
    );
  });

  it("writes no field other than the four snapshot fields", () => {
    const snapshotWithExtraField = {
      ...createSevenDaySnapshot(),
      sessionId: "7f3c9b2e-session",
    };

    expect(formatJournalLine(snapshotWithExtraField)).not.toContain(
      "sessionId",
    );
  });
});

describe("parseJournalLine", () => {
  it("reads back a line written by formatJournalLine", () => {
    const journalLine = formatJournalLine(createSevenDaySnapshot());

    expect(parseJournalLine(journalLine)).toEqual(createSevenDaySnapshot());
  });

  it("reads a line without its trailing newline", () => {
    const journalLine = formatJournalLine(createSevenDaySnapshot()).trimEnd();

    expect(parseJournalLine(journalLine)).toEqual(createSevenDaySnapshot());
  });

  it.each([
    ["text that is not JSON", "not json", "(line)"],
    ["a JSON array", "[]", "(line)"],
    [
      "an unknown window kind",
      JSON.stringify({ ...createSevenDaySnapshot(), windowKind: "monthly" }),
      "windowKind",
    ],
    [
      "a missing used percentage",
      JSON.stringify({
        ...createSevenDaySnapshot(),
        usedPercentage: undefined,
      }),
      "usedPercentage",
    ],
    [
      "a slot start that is not an ISO timestamp",
      JSON.stringify({
        ...createSevenDaySnapshot(),
        slotStartedAt: "22/10/2026 14:06",
      }),
      "slotStartedAt",
    ],
    [
      "an impossible reset date",
      JSON.stringify({
        ...createSevenDaySnapshot(),
        resetsAt: "2026-13-45T08:00:00.000Z",
      }),
      "resetsAt",
    ],
  ])(
    "rejects %s and names the field",
    (_description, journalLine, fieldPath) => {
      expect(() => parseJournalLine(journalLine)).toThrow(
        expect.objectContaining({
          name: "InvalidJournalLineError",
          fieldPath,
        }),
      );
    },
  );

  it("throws an InvalidJournalLineError instance", () => {
    expect(() => parseJournalLine("not json")).toThrow(InvalidJournalLineError);
  });
});
