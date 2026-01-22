import { Request, Response, NextFunction } from "express";
import { roleStorage } from "./roleStorage";

// Extend Express Request type to include permissions
declare global {
  namespace Express {
    interface Request {
      userPermissions?: any;
    }
  }
}

/**
 * Middleware to load user permissions into the request
 */
export async function loadPermissions(req: Request, res: Response, next: NextFunction) {
  if (req.user && (req.user as any).id) {
    try {
      const permissions = await roleStorage.getUserPermissions((req.user as any).id);
      req.userPermissions = permissions;
    } catch (error) {
      console.error("Error loading permissions:", error);
      // Continue without permissions rather than blocking the request
      req.userPermissions = {};
    }
  }
  next();
}

/**
 * Middleware to check if user has specific permission
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = (req.user as any).id;
    
    // Check if user is owner (owner has all permissions)
    const ownerEmail = process.env.OWNER_EMAIL || 'curated.collectiveai@proton.me';
    if ((req.user as any).email === ownerEmail || (req.user as any).role === 'owner') {
      return next();
    }

    try {
      const hasPermission = await roleStorage.hasPermission(userId, resource, action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: "Insufficient permissions",
          required: { resource, action }
        });
      }
      
      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
}

/**
 * Check if user has any of the specified permissions
 */
export function requireAnyPermission(permissions: Array<{ resource: string; action: string }>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = (req.user as any).id;
    
    // Check if user is owner
    const ownerEmail = process.env.OWNER_EMAIL || 'curated.collectiveai@proton.me';
    if ((req.user as any).email === ownerEmail || (req.user as any).role === 'owner') {
      return next();
    }

    try {
      for (const { resource, action } of permissions) {
        const hasPermission = await roleStorage.hasPermission(userId, resource, action);
        if (hasPermission) {
          return next();
        }
      }
      
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: permissions
      });
    } catch (error) {
      console.error("Error checking permissions:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
}

/**
 * Audit log helper for role-related operations
 */
export async function auditRoleAction(
  action: string,
  entityType: string,
  entityId: number,
  performedBy: string,
  options?: {
    targetUserId?: string;
    roleId?: number;
    previousValue?: any;
    newValue?: any;
    notes?: string;
    req?: Request;
  }
) {
  try {
    await roleStorage.createAuditLog({
      action,
      entityType,
      entityId,
      performedBy,
      targetUserId: options?.targetUserId,
      roleId: options?.roleId,
      previousValue: options?.previousValue,
      newValue: options?.newValue,
      ipAddress: options?.req?.ip,
      userAgent: options?.req?.get("user-agent"),
      notes: options?.notes,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw - audit log failure shouldn't block the operation
  }
}
