import { formatClockTime } from "../../../core/date-display.js";

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * When the limits were last recorded, e.g. "Updated 14:06".
 *
 * @param {object} props
 * @param {string} props.recordedAt ISO 8601 start of the latest slot.
 * @param {string} props.updatedPrefix e.g. "Updated".
 * @param {string} props.dateLocale e.g. "en-GB".
 */
function UpdatedTimeTag({ recordedAt, updatedPrefix, dateLocale }) {
  return (
    <p className="updated-time-tag">
      {updatedPrefix}{" "}
      <time dateTime={recordedAt}>
        {formatClockTime(Date.parse(recordedAt), {
          locale: dateLocale,
          timeZone: TIME_ZONE,
        })}
      </time>
    </p>
  );
}

export default UpdatedTimeTag;
