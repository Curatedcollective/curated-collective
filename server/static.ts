import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  // In production, the compiled dist/index.cjs is in the dist folder
  // So dist/public is in the same directory as the running script
  const distPath = path.join(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static assets with proper headers and caching
  app.use(express.static(distPath, {
    maxAge: "1y",
    immutable: true,
    setHeaders: (res, filePath) => {
      // Set proper MIME types for JS modules
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      // Enable CORS for assets (needed for dynamic imports)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // fall through to index.html if the file doesn't exist
  // BUT only for non-asset requests
  app.use("*", (req, res, next) => {
    // Don't serve index.html for asset requests that failed
    if (req.originalUrl.startsWith('/assets/') || 
        req.originalUrl.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return res.status(404).send('Asset not found');
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
