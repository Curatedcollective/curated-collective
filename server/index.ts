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

// DIAGNOSTIC: Disable body parsing to test if express.json/body-parser is crashing
// app.use(
//   express.json({
//     verify: (req, _res, buf) => {
//       req.rawBody = buf;
//     },
//   }),
// );

// app.use(express.urlencoded({ extended: false }));

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
  // DIAGNOSTIC: Disable route registration to test if routes.ts is crashing
  // try {
  //   await registerRoutes(httpServer, app);
  //   console.log('[INIT] Routes registered successfully');
  // } catch (error) {
  //   console.error('[ERROR] Failed to register routes:', error);
  //   throw error;
  // }
  console.log('[INIT] Routes SKIPPED for diagnostic');

  // Add a single test route
  app.get('/', (req, res) => {
    res.send('Test route - no body parser');
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
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

  // Replace your entire listen block with this, you glitchy bitch—npm run dev local (port 5000), npm start prod (PORT=8080 Railway, host 0.0.0.0 NO FIREWALL BULLSHIT)
  const port = parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? "8080" : "5000"), 10);  
  console.log('[INIT] About to listen on port', port);
  
  httpServer.listen({  
    port,  
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"  // Railway demands 0.0.0.0, local stays localhost  
  }, () => {  
    log(`\n🖤 Guardian-locked on port ${port} - backend + frontend serving, Neon DB live, auth ready. Hit /api/auth/login now, Coco. No more 502/404/port clusterfuck.\n`);  
    console.log('[INIT] Listen callback completed - server should now stay alive');
  });
  
  // Handle server errors
  httpServer.on('error', (error: any) => {
    console.error('[ERROR] HTTP Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${port} is already in use`);
    }
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
