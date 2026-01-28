import { config } from "dotenv";
config();

import express from "express";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// COMMENTED OUT: express.json()
// app.use(express.json());

// Single test route
app.get("/", (req, res) => {
  console.log("[ROUTE] GET / called");
  res.json({ message: "Hello" });
});

app.post("/api/auth/login", (req, res) => {
  console.log("[ROUTE] POST /api/auth/login called");
  res.json({ id: 1, email: "test@test.com" });
});

// Minimal error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[ERROR HANDLER] Caught error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = 5000;
const host = "0.0.0.0"; // Changed from 127.0.0.1
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
