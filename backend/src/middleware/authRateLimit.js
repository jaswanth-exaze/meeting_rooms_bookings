const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const STORE_MAX_SIZE = 10000;

const store = new Map();

function cleanup(now) {
  if (store.size < STORE_MAX_SIZE) return;
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

function buildKey(req) {
  const ip = String(req.ip || req.connection?.remoteAddress || "unknown");
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  return email ? `${ip}:${email}` : ip;
}

function authRateLimit(req, res, next) {
  const now = Date.now();
  cleanup(now);

  const key = buildKey(req);
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    return next();
  }

  existing.count += 1;
  store.set(key, existing);

  if (existing.count > MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(Math.max(1, retryAfterSeconds)));
    return res.status(429).json({
      message: "Too many authentication attempts. Please try again shortly."
    });
  }

  return next();
}

module.exports = authRateLimit;
