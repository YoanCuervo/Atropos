import { atom, read, update } from "claude-code";
import {
  formatModelFamilyName,
  formatRemainingTime,
  formatSignedPercentage,
  formatTokenCount,
  formatWholePercentage,
} from "../core/band-text.js";
import { computePaceDeltaPercentage } from "../core/limit-pace.js";
import { fillMessageTemplate } from "../core/message-template.js";
import { readSessionRateLimits } from "../core/session-rate-limits.js";
import { getMessages } from "../shared/locales/index.js";
import { readAtroposLanguage, recordLimitSnapshots } from "./atropos-files.js";
import {
  CONTEXT_BAR_WIDTH_PX,
  LIMIT_BAR_WIDTH_PX,
  LOGO_SIZE_PX,
  buildBarSvg,
  buildLogoSvg,
  buildTerminalBarCells,
} from "./band-graphics.js";

/** @typedef {import("../core/rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("../shared/locales/index.js").Messages} Messages */
/** @typedef {import("./atropos-files.js").ModsApi} ModsApi */

/**
 * What the band shows, kept in the session state so every drawing reads the latest figures.
 *
 * @typedef {object} BandReading
 * @property {string} modelId
 * @property {{ tokens?: number, window: number }} context
 * @property {number | null} costUsd
 * @property {import("../core/rate-limits.js").RateLimits | null} rateLimits
 * @property {import("../core/settings.js").Language} language
 */

const READING = atom({ plugin: "atropos", key: "reading" }, null);
const NOW_MS = atom({ plugin: "atropos", key: "nowMs" }, 0);

const CLOCK_TICK_MS = 60 * 1000;
const TERMINAL_BAR_CELL_COUNT = 6;

/**
 * Entry point Claude Code calls when it loads the mod.
 *
 * @type {import("claude-code").Register}
 */
export function register(on) {
  on("session.start", async ($, e, next) => {
    const result = await next(e);
    await storeReading($, await $.session.usage());
    $.clock.every(CLOCK_TICK_MS, async () => {
      const nowMs = await $.clock.now();
      await update($, NOW_MS, () => nowMs);
    });
    return result;
  });

  on("session.measure", async ($, e, next) => {
    const reading = await storeReading($, e);
    if (reading.rateLimits !== null) {
      await recordLimitSnapshots($, reading.rateLimits, await $.clock.now());
    }
    return next(e);
  });

  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    const reading = await read($, READING);
    if (reading === null || e.props.hasSurvey) {
      return next(e);
    }
    return renderBand({
      elements: $.ui.resolve(e),
      isTerminal: e.surface === "terminal",
      reading,
      nowMs: await read($, NOW_MS),
    });
  });
}

/**
 * @param {ModsApi} $
 * @param {{ context: BandReading["context"], rateLimits: unknown, cost?: { usd: number } }} usage
 *   What `$.session.usage()` or `session.measure` reports.
 * @returns {Promise<BandReading>}
 */
async function storeReading($, usage) {
  /** @type {BandReading} */
  const reading = {
    modelId: await $.session.model(),
    context: { tokens: usage.context.tokens, window: usage.context.window },
    costUsd: usage.cost?.usd ?? null,
    rateLimits: readRateLimitsOrNothing(usage.rateLimits),
    language: await readAtroposLanguage($),
  };
  const nowMs = await $.clock.now();
  await update($, READING, () => reading);
  await update($, NOW_MS, () => nowMs);
  return reading;
}

/**
 * A malformed reading must never break Claude Code: the band then shows no limits.
 *
 * @param {unknown} sessionRateLimits
 * @returns {import("../core/rate-limits.js").RateLimits | null}
 */
function readRateLimitsOrNothing(sessionRateLimits) {
  try {
    return readSessionRateLimits(sessionRateLimits);
  } catch {
    return null;
  }
}

/**
 * @param {object} band
 * @param {Record<string, Function>} band.elements The elements of the drawing surface.
 * @param {boolean} band.isTerminal
 * @param {BandReading} band.reading
 * @param {number} band.nowMs
 */
function renderBand({ elements, isTerminal, reading, nowMs }) {
  const { Box, Text, Svg } = elements;
  const messages = getMessages(reading.language);
  const bandMessages = messages.band;
  const { context } = reading;
  const contextRatio =
    context.tokens === undefined ? 0 : context.tokens / context.window;
  const limitWindows = [
    {
      label: bandMessages.fiveHourLabel,
      limitWindow: reading.rateLimits?.fiveHour,
    },
    {
      label: bandMessages.sevenDayLabel,
      limitWindow: reading.rateLimits?.sevenDay,
    },
  ].filter(({ limitWindow }) => limitWindow != null);

  return (
    <Box flexDirection="row" alignItems="center" gap="md" flexWrap="wrap">
      <Box flexDirection="row" alignItems="center" gap="sm">
        {!isTerminal && (
          <Svg
            source={buildLogoSvg()}
            alt={bandMessages.logoAlt}
            width={LOGO_SIZE_PX}
            height={LOGO_SIZE_PX}
          />
        )}
        <Text dimColor>{formatModelFamilyName(reading.modelId)}</Text>
        {renderBar({
          elements,
          isTerminal,
          ratio: contextRatio,
          widthPx: CONTEXT_BAR_WIDTH_PX,
          tone: "neutral",
          alt: fillMessageTemplate(bandMessages.contextBarAlt, {
            percentage: formatWholePercentage(
              contextRatio * 100,
              messages.dateLocale,
            ),
          }),
        })}
        <Text tabular>
          {formatTokenCount(context.tokens ?? 0)}
          <Text dimColor> / {formatTokenCount(context.window)}</Text>
        </Text>
        {reading.costUsd !== null && (
          <Text dimColor tabular>
            ${reading.costUsd.toFixed(2)}
          </Text>
        )}
      </Box>
      {limitWindows.map(({ label, limitWindow }) =>
        renderLimitWindow({
          elements,
          isTerminal,
          label,
          limitWindow,
          nowMs,
          messages,
        }),
      )}
    </Box>
  );
}

/**
 * @param {object} limitDisplay
 * @param {Record<string, Function>} limitDisplay.elements
 * @param {boolean} limitDisplay.isTerminal
 * @param {string} limitDisplay.label e.g. "5h".
 * @param {LimitWindow} limitDisplay.limitWindow
 * @param {number} limitDisplay.nowMs
 * @param {Messages} limitDisplay.messages
 */
function renderLimitWindow({
  elements,
  isTerminal,
  label,
  limitWindow,
  nowMs,
  messages,
}) {
  const { Box, Text } = elements;
  const locale = messages.dateLocale;
  const paceDelta = computePaceDeltaPercentage(limitWindow, nowMs);
  const paceColor = paceDelta >= 0 ? "success" : "error";
  const usedPercentageText = formatWholePercentage(
    limitWindow.usedPercentage,
    locale,
  );

  return (
    <Box
      key={limitWindow.windowKind}
      flexDirection="row"
      alignItems="center"
      gap="sm"
    >
      <Text dimColor>│</Text>
      <Text dimColor size="footnote">
        {label}
      </Text>
      {renderBar({
        elements,
        isTerminal,
        ratio: limitWindow.usedPercentage / 100,
        widthPx: LIMIT_BAR_WIDTH_PX,
        tone: "accent",
        alt: fillMessageTemplate(messages.band.limitBarAlt, {
          label,
          percentage: usedPercentageText,
        }),
      })}
      <Text weight="semibold" bold tabular>
        {usedPercentageText}
      </Text>
      <Box borderStyle="round" borderColor={paceColor} paddingX="xs">
        <Text color={paceColor} size="footnote" tabular>
          {formatSignedPercentage(paceDelta, locale)}
        </Text>
      </Box>
      <Text dimColor tabular>
        ↻ {formatRemainingTime(limitWindow.resetsAtMs - nowMs, messages.band)}
      </Text>
    </Box>
  );
}

/**
 * @param {object} barDisplay
 * @param {Record<string, Function>} barDisplay.elements
 * @param {boolean} barDisplay.isTerminal
 * @param {number} barDisplay.ratio From 0 to 1.
 * @param {number} barDisplay.widthPx
 * @param {import("./band-graphics.js").BarTone} barDisplay.tone
 * @param {string} barDisplay.alt What the gauge says, for a reader that cannot see it.
 */
function renderBar({ elements, isTerminal, ratio, widthPx, tone, alt }) {
  const { Svg, Text } = elements;
  if (isTerminal) {
    const { filled, empty } = buildTerminalBarCells(
      ratio,
      TERMINAL_BAR_CELL_COUNT,
    );
    return (
      <Text>
        <Text color={tone === "accent" ? "claude" : "text"}>{filled}</Text>
        <Text dimColor>{empty}</Text>
      </Text>
    );
  }
  return (
    <Svg
      source={buildBarSvg({ ratio, widthPx, tone })}
      alt={alt}
      width={widthPx}
      height={6}
    />
  );
}
