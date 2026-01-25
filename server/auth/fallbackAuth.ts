/**
 * Fallback Authentication for Non-Replit Environments
 * 
 * This provides a simple authentication solution for:
 * - Local development
 * - Vercel deployments
 * - Any environment where Replit Auth is not available
 * 
 * Uses passport-local strategy with email/password
 */

import type { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { authStorage } from "../replit_integrations/auth/storage";
import { type User } from "@shared/models/auth";

// Simple password validation (in production, use bcrypt)
// For now, we'll use a simple demo password system
const DEMO_USERS = [
  {
    email: "curated.collectiveai@proton.me",
    password: "demo123",
    role: "owner",
    firstName: "Curated",
    lastName: "Collective",
    displayName: "The Veil"
  },
  {
    email: "demo@example.com",
    password: "demo123",
    role: "user",
    firstName: "Demo",
    lastName: "User",
    displayName: "Demo User"
  }
];

export function setupFallbackAuth(app: Express): void {
  console.log("Setting up fallback authentication for non-Replit environment");

  // Configure passport with local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        // Check demo users
        const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!demoUser) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (demoUser.password !== password) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Create or update user in database
        const user = await authStorage.upsertUser({
          id: `local_${email.toLowerCase()}`,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          displayName: demoUser.displayName,
          role: demoUser.role,
          profileImageUrl: undefined,
          stripeCustomerId: undefined,
          stripeSubscriptionId: undefined
        });

        // Add isOwner flag for easy checking
        (user as any).isOwner = user.role === 'owner' || user.email === 'curated.collectiveai@proton.me';
        
        return done(null, user);
      } catch (error) {
        console.error("Fallback auth error:", error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await authStorage.getUser(id);
      if (user) {
        // Add isOwner flag
        (user as any).isOwner = user.role === 'owner' || user.email === 'curated.collectiveai@proton.me';
      }
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
}

export function registerFallbackAuthRoutes(app: Express): void {
  console.log("Registering fallback auth routes");

  // Login page - just redirect to client login page
  app.get("/api/login", (req: Request, res: Response) => {
    res.redirect("/login");
  });

  // Login POST endpoint
  app.post("/api/login", passport.authenticate("local"), (req: Request, res: Response) => {
    const redirect = (req.query.redirect as string) || "/agents";
    res.json({ 
      success: true, 
      user: req.user,
      redirect 
    });
  });

  // Logout endpoint
  app.get("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });

  // Get current user
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.json(null);
    }

    try {
      const user = req.user as User;
      // Add isOwner flag
      (user as any).isOwner = user.role === 'owner' || user.email === 'curated.collectiveai@proton.me';
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Demo signup endpoint (creates demo users)
  app.post("/api/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Check if user already exists
      const existingUser = await authStorage.getUser(`local_${email.toLowerCase()}`);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const user = await authStorage.upsertUser({
        id: `local_${email.toLowerCase()}`,
        email,
        firstName: firstName || "User",
        lastName: lastName || "",
        displayName: `${firstName || "User"} ${lastName || ""}`.trim(),
        role: "user",
        profileImageUrl: undefined,
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined
      });

      // Auto-login after signup
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(500).json({ message: "User created but auto-login failed" });
        }
        res.json({ 
          success: true, 
          user,
          message: "Account created successfully" 
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticatedFallback(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}
