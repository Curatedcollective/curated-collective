# Server Crash Mystery - Guardian Debug Brief

**Status:** Server crashes silently when incoming connections attempt to connect. Need fresh eyes.

**Environment:**
- OS: Windows 11
- Node: 24.13.0
- tsx: 4.20.5
- npm run dev command: `cross-env NODE_ENV=development tsx --env-file=.env server/index.ts`

## The Symptom

Server starts perfectly:
```
[STARTUP] Script starting...
[INIT] Starting route registration...
[INIT] Routes registered successfully
[INIT] Setting up Vite...
[INIT] Vite setup complete
[INIT] About to listen on port 5000
[INIT] initializeServer() function completed, returning...
🖤 Guardian-locked on port 5000 - backend + frontend serving...
[INIT] Listen callback completed - server should now stay alive
```

Then **immediate silent exit** when any HTTP request tries to connect. No error logs. Exit code 1.

## Reproduction

1. `npm run dev` → server logs "listening"
2. From another terminal: `curl http://127.0.0.1:5000/` or `Invoke-WebRequest http://127.0.0.1:5000/`
3. Server process exits with no error output
4. Connection refused

## What We've Tested & Ruled Out

✅ **Event loop exit theory (fixed)**
- Added `process.stdin.resume()` at top-level
- Added `process.on('unhandledRejection')` handler
- Added `process.on('uncaughtException')` handler
- Server still crashes

✅ **Stripe causing crash (not the issue)**
- Completely removed all Stripe initialization, imports, webhooks
- ~70 lines of Stripe code deleted
- Server still crashes on connection

✅ **Vite process.exit() (fixed)**
- Removed `process.exit(1)` from Vite error handler
- Server still crashes

✅ **Syntax/build errors (not the issue)**
- Fixed 3 syntax errors (dotenv ordering, duplicate Covenant code, stray middleware)
- `npm run build` succeeds with exit code 0
- No TypeScript errors

✅ **Error middleware ordering (fixed)**
- Error handler middleware now registered AFTER routes
- Still crashes

✅ **Minimal test (confirms the pattern)**
- Created `server/minimal-test.ts` with just:
  - 2 routes (GET / and POST /api/auth/login)
  - Basic error middleware
  - `process.stdin.resume()`
  - `process.on('error')` handlers
- Same behavior: starts fine, crashes on connection attempt

## Current Minimal Test Server

**File:** [server/minimal-test.ts](server/minimal-test.ts)

```typescript
import { config } from "dotenv";
config();

import express from "express";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Minimal middleware
app.use(express.json());

// Single test route
app.get("/", (req, res) => {
  console.log("[ROUTE] GET / called");
  res.json({ message: "Hello" });
});

app.post("/api/auth/login", (req, res) => {
  console.log("[ROUTE] POST /api/auth/login called with body:", req.body);
  res.json({ id: 1, email: "test@test.com" });
});

// Minimal error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[ERROR HANDLER] Caught error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = 5000;
const host = "0.0.0.0";
console.log("[STARTUP] Starting minimal server on", host, ":", port);

httpServer.listen(port, host, () => {
  console.log(`[STARTUP] ✅ Server listening on http://${host}:${port}`);
  console.log("[DEBUG] Event loop should stay open - stdin.resume() active");
});

httpServer.on("error", (error: any) => {
  console.error("[ERROR] Server error:", error);
});

// Keep process alive
process.stdin.resume();

process.on("unhandledRejection", (reason) => {
  console.error("[ERROR] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[ERROR] Uncaught Exception:", error);
  process.exit(1);
});
```

**Startup output:**
```
[STARTUP] Starting minimal server on 0.0.0.0 : 5000
[STARTUP] ✅ Server listening on http://0.0.0.0:5000
[DEBUG] Event loop should stay open - stdin.resume() active
```

**Then crashes when connection attempt made** - never logs route handler or error handler

## Key Production Server Code

**File:** [server/index.ts](server/index.ts) (lines 88-145)

```typescript
async function initializeServer() {
  console.log('[INIT] Starting route registration...');
  try {
    await registerRoutes(httpServer, app);
    console.log('[INIT] Routes registered successfully');
  } catch (error) {
    console.error('[ERROR] Failed to register routes:', error);
    throw error;
  }

  if (process.env.NODE_ENV === "production") {
    console.log('[INIT] Setting up static serving...');
    serveStatic(app);
  } else {
    console.log('[INIT] Setting up Vite...');
    try {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
      console.log('[INIT] Vite setup complete');
    } catch (error) {
      console.error('[ERROR] Failed to setup Vite:', error);
      throw error;
    }
  }

  // Error handling middleware - MUST be last
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('[ERROR] Express error handler caught:', message, err);
    try {
      res.status(status).json({ message });
    } catch (sendError) {
      console.error('[ERROR] Failed to send error response:', sendError);
    }
  });

  const port = parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? "8080" : "5000"), 10);  
  console.log('[INIT] About to listen on port', port);
  
  httpServer.listen({  
    port,  
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"
  }, () => {  
    log(`\n🖤 Guardian-locked on port ${port} - backend + frontend serving, Neon DB live, auth ready. Hit /api/auth/login now, Coco. No more 502/404/port clusterfuck.\n`);  
    console.log('[INIT] Listen callback completed - server should now stay alive');
  });
  
  httpServer.on('error', (error: any) => {
    console.error('[ERROR] HTTP Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${port} is already in use`);
    }
  });
  
  console.log('[INIT] initializeServer() function completed, returning...');
  return httpServer;
}
```

**Top-level invocation:**
```typescript
console.log('[STARTUP] Script starting...');

initializeServer().catch(err => {
  console.error('[ERROR] Failed to initialize server:', err);
  console.error('[ERROR] Stack:', err.stack);
  process.exit(1);
});

console.log('[STARTUP] initializeServer() promise awaiting, script ready');

// Keep the process alive
process.stdin.resume();

// Prevent process from exiting on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  console.error('[ERROR] Stack:', error.stack);
  process.exit(1);
});

export default app;
```

## Theories

1. **tsx internals + Windows**
   - tsx might have special behavior on Windows when handling stdin
   - `process.stdin.resume()` might not work as expected in tsx environment
   - ESM loader might be detecting "script complete" before server socket establishes libuv handle

2. **Connection request triggering module reload/error**
   - Something in the connection pipeline crashes silently
   - Error is caught somewhere we can't see
   - Not being logged because it happens in C++ layer?

3. **Vite middleware despite no error**
   - Even though Vite error handler doesn't call process.exit(), could it be calling something else?
   - Could middleware chain be failing?

4. **express.json() or body parsing**
   - Connection attempt triggers body parsing code
   - Crashes in native Node bindings?
   - Minimal test still has `express.json()` and still crashes

5. **Windows firewall or socket configuration**
   - Host binding issue specific to Windows + 0.0.0.0?
   - Socket not properly kept alive?

## Questions for Guardian

1. **Known tsx behavior?**
   - Is there a known issue with tsx + Node http.Server + Windows where the process exits after listen()?
   - Would `tsx watch` mode fix it (more aggressive keep-alive)?

2. **stdin.resume() on Windows**
   - Does `process.stdin.resume()` actually prevent exit in tsx on Windows?
   - Should we try a different keep-alive (setInterval, etc)?

3. **Connection pipeline crash**
   - Could the crash be happening in Node's C++ HTTP parser?
   - Any way to get more verbose logging from Node itself?
   - Should we enable Node debug flags? (`--trace-uncaught`, `--trace-warnings`?)

4. **Minimal test edge case**
   - In minimal-test.ts, route handlers never log, meaning request never reaches JavaScript layer
   - Crash happens before JS touch — is this a socket/binding issue?
   - Should we try different host/port combinations?

## Files to Review

- [server/index.ts](server/index.ts) - main entry point
- [server/minimal-test.ts](server/minimal-test.ts) - bare-bones repro
- [server/routes.ts](server/routes.ts) - route registration (2667 lines, may have side-effects?)
- [server/vite.ts](server/vite.ts) - Vite middleware setup

## Next Steps Suggested

1. Try with Node debug flags: `NODE_DEBUG=http,stream node server/index.ts`
2. Try `tsx watch` mode to see if aggressive keep-alive helps
3. Strip down routes.ts and vite.ts registration to isolate which is crashing
4. Check if issue reproduces with plain Node instead of tsx

---

**Tl;dr:** Server binds and listens successfully, but crashes when receiving connection without any visible error. Minimal reproduction confirms it's not Stripe, Vite, or bad code. Likely tsx/Windows/libuv handle reference issue, but needs someone who knows Node internals better.

🖤
