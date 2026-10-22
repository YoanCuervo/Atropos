import { describe, expect, it } from "vitest";
import { SLOT_DURATION_MS, computeSlotStartMs } from "./time-slots.js";

describe("SLOT_DURATION_MS", () => {
  it("lasts six minutes", () => {
    expect(SLOT_DURATION_MS).toBe(360_000);
  });
});

describe("computeSlotStartMs", () => {
  it("keeps a timestamp that is exactly on a slot start", () => {
    const slotStartMs = Date.UTC(2026, 9, 22, 14, 6, 0, 0);

    expect(computeSlotStartMs(slotStartMs)).toBe(slotStartMs);
  });

  it("brings the last millisecond of a slot back to its start", () => {
    const lastMillisecondMs = Date.UTC(2026, 9, 22, 14, 11, 59, 999);

    expect(computeSlotStartMs(lastMillisecondMs)).toBe(
      Date.UTC(2026, 9, 22, 14, 6, 0, 0),
    );
  });

  it("starts a new slot on the next hour", () => {
    const lastSlotOfHourMs = Date.UTC(2026, 9, 22, 14, 59, 59, 999);
    const firstSlotOfNextHourMs = Date.UTC(2026, 9, 22, 15, 0, 0, 0);

    expect(computeSlotStartMs(lastSlotOfHourMs)).toBe(
      Date.UTC(2026, 9, 22, 14, 54, 0, 0),
    );
    expect(computeSlotStartMs(firstSlotOfNextHourMs)).toBe(
      firstSlotOfNextHourMs,
    );
  });

  it("splits an hour into ten slots", () => {
    const hourStartMs = Date.UTC(2026, 9, 22, 14, 0, 0, 0);
    const minutesOfHour = Array.from({ length: 60 }, (_, minute) => minute);

    const distinctSlotStarts = new Set(
      minutesOfHour.map((minute) =>
        computeSlotStartMs(hourStartMs + minute * 60_000),
      ),
    );

    expect(distinctSlotStarts.size).toBe(10);
  });
});
