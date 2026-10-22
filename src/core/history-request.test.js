import { describe, expect, it } from "vitest";
import {
  computeHistoryStartMs,
  parseHistoryRequest,
} from "./history-request.js";

describe("parseHistoryRequest", () => {
  it("accepts a supported window and period", () => {
    expect(
      parseHistoryRequest({ windowKind: "seven_day", periodDayCount: 30 }),
    ).toEqual({ windowKind: "seven_day", periodDayCount: 30 });
  });

  it("keeps only the expected fields", () => {
    const rawRequest = {
      windowKind: "five_hour",
      periodDayCount: 7,
      sql: "DROP TABLE limit_snapshots",
    };

    expect(parseHistoryRequest(rawRequest)).toEqual({
      windowKind: "five_hour",
      periodDayCount: 7,
    });
  });

  it.each([
    ["a request that is not an object", "seven_day", "(request)"],
    [
      "an unknown window kind",
      { windowKind: "monthly", periodDayCount: 7 },
      "windowKind",
    ],
    [
      "an unsupported period",
      { windowKind: "seven_day", periodDayCount: 365 },
      "periodDayCount",
    ],
    [
      "a period given as text",
      { windowKind: "seven_day", periodDayCount: "7" },
      "periodDayCount",
    ],
  ])(
    "rejects %s and names the field",
    (_description, rawRequest, fieldPath) => {
      expect(() => parseHistoryRequest(rawRequest)).toThrow(
        expect.objectContaining({
          name: "InvalidHistoryRequestError",
          fieldPath,
        }),
      );
    },
  );
});

describe("computeHistoryStartMs", () => {
  it("goes back the requested number of days", () => {
    const nowMs = Date.UTC(2026, 9, 22, 14, 6, 0, 0);

    expect(computeHistoryStartMs(nowMs, 7)).toBe(
      Date.UTC(2026, 9, 15, 14, 6, 0, 0),
    );
  });
});
