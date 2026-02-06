// Load environment variables FIRST, before any other imports
import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// GUARDIAN'S KEEP-ALIVE - Log PID and keep-alive signal
console.log('PID:', process.pid);
setInterval(() => console.log('Alive PID:', process.pid), 3000);

// DUMMY HEALTH ENDPOINT - For Fly.io health checks
app.get('/health', (req, res) => res.sendStatus(200));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Stripe removed - will add back later when site is working
// Stripe webhook endpoint disabled
// app.post(
//   '/api/stripe/webhook',
//   express.raw({ type: 'application/json' }),
//   async (req, res) => {
//     const signature = req.headers['stripe-signature'];
//
//     if (!signature) {
//       return res.status(400).json({ error: 'Missing stripe-signature' });
//     }
//
//     try {
//       const sig = Array.isArray(signature) ? signature[0] : signature;
//
//       if (!Buffer.isBuffer(req.body)) {
//         console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer.');
//         return res.status(500).json({ error: 'Webhook processing error' });
//       }
//
//       await WebhookHandlers.processWebhook(req.body as Buffer, sig);
//       res.status(200).json({ received: true });
//     } catch (error: any) {
//       console.error('Webhook error:', error.message);
//       res.status(400).json({ error: 'Webhook processing error' });
//     }
//   }
// );

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
  console.log('[INIT] Initializing server...');
  console.log('[INIT] DATABASE_URL configured:', !!process.env.DATABASE_URL);

  const PORT = parseInt(process.env.PORT || '8080', 10);
  // Allow overriding bind host via environment for public deployments.
  // Default to 0.0.0.0 so the server is reachable from external hosts when deployed.
  const HOST = process.env.HOST || '0.0.0.0';
  console.log(`[INIT] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[INIT] About to listen on ${HOST}:${PORT} (will try alternate ports if occupied)`);

  async function startListening(startPort: number, attempts = 5): Promise<number> {
    let port = startPort;
    for (let i = 0; i < attempts; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const onError = (err: any) => {
            httpServer.off('listening', onListen);
            httpServer.off('error', onError);
            reject(err);
          };

          const onListen = () => {
            httpServer.off('error', onError);
            httpServer.off('listening', onListen);
            resolve();
          };

          httpServer.once('error', onError);
          httpServer.once('listening', onListen);
          httpServer.listen(port, HOST);
        });

        console.log(`🖤 Guardian-locked on ${HOST}:${port} - backend + frontend serving...`);
        return port;
      } catch (err: any) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`[WARN] Port ${port} in use, trying ${port + 1}`);
          port = port + 1;
          // continue loop to retry
        } else {
          console.error('[ERROR] Failed to bind server:', err);
          throw err;
        }
      }
    }
    throw new Error('Failed to bind to any port');
  }

  try {
    const boundPort = await startListening(PORT, 10);

    try {
      // Test database connection FIRST before anything else
      console.log('[INIT] Testing database connection...');
      console.log('[INIT] DATABASE_URL configured:', !!process.env.DATABASE_URL);
      const dbImport = await import('./db');
      console.log('[INIT] DB module loaded, testing connection...');
      await dbImport.db.execute('SELECT 1');
      console.log('[INIT] Database connection verified');

      // Register all API routes AFTER database is confirmed working
      console.log('[INIT] Registering routes...');
      await registerRoutes(httpServer, app, { allowOffline: false });
      console.log('[INIT] Routes registered successfully');

      // Serve static files (React app) AFTER routes
      console.log('[INIT] Setting up static file serving...');
      serveStatic(app);
      console.log('[INIT] Static file serving configured');

      console.log('[INIT] Server initialization complete - sanctuary awakened');
    } catch (error) {
      console.error('[ERROR] Failed to initialize after listen:', error);
      console.error('[ERROR] Stack:', (error as Error).stack);
      console.log('[WARN] Server will continue with limited functionality');

      try {
        console.log('[INIT] Registering routes in offline mode...');
        await registerRoutes(httpServer, app, { allowOffline: true });
        console.log('[INIT] Offline routes registered');
        serveStatic(app);
      } catch (err) {
        console.error('[INIT] Failed to register offline routes:', err);
      }
    }

    console.log('[INIT] initializeServer() returning...');
    return httpServer;
  } catch (err) {
    console.error('[FATAL] Could not start server:', err);
    throw err;
  }
}

console.log('[STARTUP] Script starting...');

initializeServer().catch(err => {
  console.error('[ERROR] Failed to initialize server:', err);
  console.error('[ERROR] Stack:', err.stack);
  process.exit(1);
});

console.log('[STARTUP] initializeServer() promise awaiting, script ready');

// Keep the process alive - prevents natural exit after async init
// The server socket should keep event loop alive, but tsx/ESM sometimes doesn't reference it properly
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

// Export for Vercel serverless
export default app;
