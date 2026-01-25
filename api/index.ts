import express from "express";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initialize() {
  if (initialized) return;
  
  const { registerRoutes } = await import("../server/routes");
  await registerRoutes(httpServer, app);
  
  initialized = true;
}

export default async function handler(req: any, res: any) {
  await initialize();
  
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve(undefined);
    });
  });
}
