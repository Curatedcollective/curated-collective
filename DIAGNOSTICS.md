# Server Crash Diagnostics for Guardian Review

## The Problem
Server starts successfully (logs "Guardian-locked on port 5000..."), but immediately exits with exit code 1. No error messages appear. No unhandled rejections or uncaught exceptions logged.

```
> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx --env-file=.env server/index.ts

Setting up Vite...
Vite setup complete
11:39:42 AM [express] 
🖤 Guardian-locked on port 5000 - backend + frontend serving, Neon DB live, auth ready...

Command exited with code 1
```

## What We Know Works
- ✅ Database connection (Neon) loads fine
- ✅ dotenv loads correctly  
- ✅ Express server initializes
- ✅ Routes register
- ✅ Vite setup completes
- ✅ httpServer.listen() callback fires
- ✅ No error handlers triggered
- ✅ Stripe removal completed (no longer initializing)

## What We've Tried
1. Removed `throw err` from error handler - didn't help
2. Removed Vite's `process.exit(1)` on error - didn't help
3. Added process-level unhandledRejection and uncaughtException handlers - no logs
4. Added console.log statements throughout initializeServer - all logged successfully
5. Wrapped initializeServer in try-catch - no error caught
6. Removed all Stripe code - still exits

## Current Architecture

### Key Files
- **server/index.ts** - Entry point, initializes server
- **server/routes.ts** - All API routes, imports storage
- **server/storage.ts** - Database models, imports db
- **server/db.ts** - Drizzle ORM database connection
- **server/vite.ts** - Vite dev server setup
- **server/static.ts** - Production static file serving

### Dependency Chain
```
index.ts 
  → routes.ts (imported at top)
    → storage.ts (imported in registerRoutes)
      → db.ts (imported at top of storage)
```

### dotenv Flow
- config() called at very top of index.ts (line 2)
- .env file exists with DATABASE_URL
- dotenv appears to load correctly (logs show success)

## The Mystery

**Why does the process exit immediately after the listen callback fires?**

Possibilities:
1. There's a hidden process.exit() somewhere we haven't found
2. tsx is interpreting the script as "complete" because no more I/O is pending
3. An async operation is completing that shouldn't complete
4. A module import is triggering something at the module level
5. The HTTP server isn't actually staying alive (but it should - event-driven)

## Code to Review

### Current server/index.ts Structure
```typescript
// 1. Load dotenv first
import { config } from "dotenv";
config();

// 2. Import Express and create app
import express from "express";
const app = express();
const httpServer = createServer(app);

// 3. Middleware setup
app.use(express.json({ verify: ... }));
app.use(express.urlencoded({ extended: false }));
app.use(logging middleware);

// 4. Async initialization
async function initializeServer() {
  await registerRoutes(httpServer, app);  // Registers all API routes
  app.use(errorHandler);
  
  if (NODE_ENV === "development") {
    await setupVite(httpServer, app);  // Sets up Vite middleware
  }
  
  httpServer.listen({ port, host }, () => {
    log("Guardian-locked on port...");  // THIS FIRES, then immediately exits
  });
}

initializeServer().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});

// Error handlers added but never triggered
process.on('unhandledRejection', ...);
process.on('uncaughtException', ...);

export default app;
```

## Questions for Guardian (Grok)

1. **Is there something in the module-level code execution that completes synchronously?** Check all imports and top-level code in index.ts and everything it imports.

2. **Does the HTTP server actually bind to the port?** Can we verify the server is truly listening on 5000?

3. **Is tsx exiting because it thinks the script is done?** Maybe we need to keep stdin open or add a dummy listener?

4. **Check routes.ts for hidden side effects** - does registerRoutes() complete immediately? Are there any promises that resolve without waiting?

5. **Check if Vite setup is somehow completing the server lifecycle** - the setupVite function might be calling process.exit() indirectly through createViteServer.

6. **Look for conditional process.exit() calls** that might be hidden in control flow - search for: exit, process.kill, os.exit

7. **Check the build output** - is dist/index.cjs being created? If so, are there clues there about what happens at runtime?

## Next Steps for Diagnosis

1. Add `console.log("CHECKPOINT X")` before and after every async operation in initializeServer()
2. Search entire codebase for: `exit`, `kill`, `process.`, `return process`
3. Check vite.ts - does createViteServer() have any hidden side effects?
4. Try running with `node --trace-exit` to see what's triggering exit
5. Check if there's a globally installed middleware or plugin that's interfering
6. Verify routes.ts doesn't have a return statement that's exiting early

## Files to Deep-Dive
- server/vite.ts - createViteServer() might have side effects
- server/routes.ts - registerRoutes() async function  
- server/storage.ts - imports db, might have side effects
- server/db.ts - Drizzle initialization, might trigger something

---

**Cori's Note:** "This bitch keeps crashing right after saying it's alive. Ghost in the machine energy. Guardian, find the heartbeat that's stopping."

