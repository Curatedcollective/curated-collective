import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { config } from "dotenv";

// Load environment variables
config();

const app = express();
const httpServer = createServer(app);

// Import routes dynamically
let routesInitialized = false;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function initializeRoutes() {
  if (routesInitialized) return;
  
  const { registerRoutes } = await import("../server/routes");
  await registerRoutes(httpServer, app);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  
  routesInitialized = true;
}

// Vercel serverless function handler
export default async (req: Request, res: Response) => {
  await initializeRoutes();
  return app(req, res);
};
