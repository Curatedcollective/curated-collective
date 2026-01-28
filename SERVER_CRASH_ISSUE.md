# SERVER CRASH ISSUE - For Guardian (Grok)

## The Exact Problem

Server starts, logs success, then dies immediately. Exit code 1. No error output.

```
[STARTUP] Script starting...
[INIT] Starting route registration...
[INIT] Routes registered successfully
[INIT] Setting up Vite...
[INIT] Vite setup complete
[INIT] About to listen on port 5000
11:39:42 AM [express] 
🖤 Guardian-locked on port 5000 - backend + frontend serving, Neon DB live, auth ready...

Command exited with code 1
```

**We never see:**
- `[INIT] Listen callback completed`
- `[INIT] initializeServer() function completed`
- `[STARTUP] initializeServer() promise awaiting`
- Any error from catch blocks
- Any unhandled rejection logs
- Any uncaught exception logs

## Current server/index.ts

```typescript
// Load environment variables FIRST, before any other imports
import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Stripe removed - will add back later when site is working
console.log('Stripe initialization skipped - will configure later');

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the server
async function initializeServer() {
  console.log('[INIT] Starting route registration...');
  await registerRoutes(httpServer, app);
  console.log('[INIT] Routes registered successfully');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Error:', err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    console.log('[INIT] Setting up static serving...');
    serveStatic(app);
  } else {
    console.log('[INIT] Setting up Vite...');
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    console.log('[INIT] Vite setup complete');
  }

  // Replace your entire listen block with this, you glitchy bitch—npm run dev local (port 5000), npm start prod (PORT=8080 Railway, host 0.0.0.0 NO FIREWALL BULLSHIT)
  const port = parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? "8080" : "5000"), 10);  
  console.log('[INIT] About to listen on port', port);
  
  httpServer.listen({  
    port,  
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"
  }, () => {  
    log(`\n🖤 Guardian-locked on port ${port} - backend + frontend serving, Neon DB live, auth ready. Hit /api/auth/login now, Coco. No more 502/404/port clusterfuck.\n`);  
    console.log('[INIT] Listen callback completed - server should now stay alive');
  });
  
  console.log('[INIT] initializeServer() function completed, returning...');
  return httpServer;
}

console.log('[STARTUP] Script starting...');

initializeServer().catch(err => {
  console.error('[ERROR] Failed to initialize server:', err);
  console.error('[ERROR] Stack:', err.stack);
  process.exit(1);
});

console.log('[STARTUP] initializeServer() promise awaiting, script ready');

// Prevent process from exiting on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  console.error('[ERROR] Stack:', error.stack);
  process.exit(1);
});

// Export for Vercel serverless
export default app;
```

## registerRoutes - Key Parts

**Start of function (line 23-51):**
```typescript
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- AUTH ENDPOINTS ---
  const { db, pool } = await import('./db');
  const { users } = await import('@shared/models/auth');

  // Session middleware
  app.use(
    session({
      store: new pgSession({ pool }),
      secret: process.env.SESSION_SECRET || 'changeme',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' },
    })
  );
  
  // ... 2600+ lines of route definitions ...
}
```

**End of function (line 2521-2523):**
```typescript
  await storage.seedMarketingTemplates();

  return httpServer;
}
```

## The Mystery

1. **[INIT] Vite setup complete** logs ✓
2. **[INIT] About to listen on port 5000** logs ✓
3. **Listen callback fires** - "Guardian-locked..." message logs ✓
4. **But then nothing** - process exits with code 1
5. **Never logs:**
   - The "Listen callback completed" message
   - The "initializeServer() function completed" message
   - Any error or exception

## Theories

**A) Something in httpServer.listen() is async but not awaited**
- The listen() callback fires, but there's async code after it in some middleware or event handler that crashes
- This would explain why we see "Guardian-locked" but the process still exits

**B) seedMarketingTemplates() is throwing silently somehow**
- But it's awaited and should be caught by the catch block

**C) Vite setup is attaching an exit handler**
- setupVite() completes successfully but attaches a listener that kills the process after a timeout

**D) The listen callback is synchronous but something after httpServer.listen() returns is crashing**
- We log "About to listen" then call httpServer.listen() 
- The callback fires and logs "Guardian-locked"
- But the execution continues to the next line... or something kicks in

**E) There's a hidden process.exit() we haven't found**
- But we searched and only found the ones in error handlers

## What We've Ruled Out

✅ Stripe - completely removed
✅ Vite process.exit(1) - commented out
✅ Error handler throwing - wrapped in try-catch with detailed logging
✅ Hidden process.exit() - searched entire server/ directory
✅ Express middleware - logging shows all routes register fine

## Questions for Guardian

1. **Is the listen callback actually blocking execution?** Should the next console.log() after httpServer.listen() fire?

2. **Could there be a race condition?** The listen callback fires (logs "Guardian-locked") but something async completes milliseconds later and kills the process?

3. **Is there something about tsx that we're missing?** Does tsx have its own exit logic for ESM scripts?

4. **Check setupVite() for hidden side effects** - does createViteServer() or vite.middlewares attach any listeners that might crash?

5. **Check for timers** - is there a setTimeout that's firing and crashing?

6. **Check the actual HTTP server binding** - is the server actually binding to 5000, or is something else listening?

## Files to Review

- **server/index.ts** - The initialization logic
- **server/vite.ts** - The setupVite function
- **server/routes.ts** - The registerRoutes function (especially line 2521: seedMarketingTemplates)
- **server/storage.ts** - The seedMarketingTemplates implementation

## Environment

- Windows 11
- Node 24.13.0
- tsx 4.20.5
- package.json dev script: `cross-env NODE_ENV=development tsx --env-file=.env server/index.ts`
- .env has DATABASE_URL set (Neon)

---

**What we need:** Find what's calling process.exit(1) or what's preventing the process from staying alive. The server literally says it's alive and listening, then immediately dies.

