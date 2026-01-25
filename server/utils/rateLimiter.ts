// Very small in-memory rate limiter for owner AI assist endpoint.
// - Limit is per-userId (if logged in) otherwise per-IP.
// - Window is a rolling minute. This is intentionally simple (no persistence).

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 10;

type Entry = { windowStart: number; count: number };
const map = new Map<string, Entry>();

export function checkAiAssistRateLimit(key: string) {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry) {
    map.set(key, { windowStart: now, count: 1 });
    return true;
  }

  if (now - entry.windowStart > WINDOW_MS) {
    // reset window
    entry.windowStart = now;
    entry.count = 1;
    map.set(key, entry);
    return true;
  }

  entry.count += 1;
  map.set(key, entry);
  return entry.count <= MAX_PER_WINDOW;
}
