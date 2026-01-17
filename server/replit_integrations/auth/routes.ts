import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    // Set a timeout for the request (3 seconds)
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({ message: "Service temporarily unavailable" });
      }
    }, 3000);

    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      clearTimeout(timeoutId);
      if (!res.headersSent) {
        res.json(user);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error fetching user:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to fetch user" });
      }
    }
  });
}
