import { useEffect, useState } from "react";

const MILLISECONDS_PER_MINUTE = 60 * 1000;

/**
 * The current time, refreshed every minute, for the texts that count down to a reset.
 *
 * @returns {number} Unix timestamp, in milliseconds.
 */
export function useCurrentTimeMs() {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(
      () => setCurrentTimeMs(Date.now()),
      MILLISECONDS_PER_MINUTE,
    );
    return () => clearInterval(intervalId);
  }, []);

  return currentTimeMs;
}
