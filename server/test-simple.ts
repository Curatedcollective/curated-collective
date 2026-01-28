import { config } from "dotenv";
config();

import express from "express";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Literally nothing else
const port = 5000;
const host = "127.0.0.1";

console.log("About to listen...");

httpServer.listen(port, host, () => {
  console.log(`✓ Server listening on ${host}:${port}`);
  console.log("Server is alive and will stay alive");
});

// Keep process alive
process.stdin.resume();

console.log("Script finished executing, process should stay alive");
