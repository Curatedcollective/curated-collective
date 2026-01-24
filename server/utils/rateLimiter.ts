// Very small in-memory rate limiter for owner AI assist endpoint.
// - Limit is per-userId (if logged in) otherwise per-IP.
// - Window is a rolling minute. This is intentionally simple (no persistence).

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 10;
const CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

type Entry = { windowStart: number; count: number };
const map = new Map<string, Entry>();

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of map.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      map.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

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
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}
