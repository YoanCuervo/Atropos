export type BandLimitWindow = {
  windowKind: "five_hour" | "seven_day";
  usedPercentage: number;
  resetsAtMs: number;
};

export type BandReading = {
  modelId: string;
  context: { tokens?: number; window: number };
  costUsd: number | null;
  rateLimits: {
    fiveHour: BandLimitWindow | null;
    sevenDay: BandLimitWindow | null;
  } | null;
  language: "en" | "fr";
};

declare module "claude-code" {
  interface PluginState {
    atropos: { reading: BandReading | null; nowMs: number };
  }
}
