import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

export interface Permissions {
  dashboard?: { view?: boolean; edit?: boolean };
  users?: { view?: boolean; edit?: boolean; delete?: boolean; assignRoles?: boolean };
  agents?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; curate?: boolean };
  creations?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; curate?: boolean };
  lore?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; curate?: boolean };
  chat?: { access?: boolean; moderate?: boolean };
  messaging?: { send?: boolean; moderate?: boolean };
  events?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; moderate?: boolean };
  audit?: { view?: boolean };
  settings?: { view?: boolean; edit?: boolean };
  roles?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; assign?: boolean };
  ceremonies?: { view?: boolean; author?: boolean; edit?: boolean; delete?: boolean };
  guardian?: { view?: boolean; configure?: boolean };
}

interface UserRole {
  id: number;
  roleId: number;
  isActive: boolean;
  role: {
    id: number;
    name: string;
    displayName: string;
    permissions: Permissions;
    priority: number;
  };
}

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({});
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Owner has all permissions
  const isOwner = user?.email === 'curated.collectiveai@proton.me' || (user as any)?.role === 'owner';

  useEffect(() => {
    if (!user) {
      setPermissions({});
      setUserRoles([]);
      setLoading(false);
      return;
    }

    // Owner gets all permissions automatically
    if (isOwner) {
      setPermissions({
        dashboard: { view: true, edit: true },
        users: { view: true, edit: true, delete: true, assignRoles: true },
        agents: { view: true, create: true, edit: true, delete: true, curate: true },
        creations: { view: true, create: true, edit: true, delete: true, curate: true },
        lore: { view: true, create: true, edit: true, delete: true, curate: true },
        chat: { access: true, moderate: true },
        messaging: { send: true, moderate: true },
        events: { view: true, create: true, edit: true, delete: true, moderate: true },
        audit: { view: true },
        settings: { view: true, edit: true },
        roles: { view: true, create: true, edit: true, delete: true, assign: true },
        ceremonies: { view: true, author: true, edit: true, delete: true },
        guardian: { view: true, configure: true },
      });
      setLoading(false);
      return;
    }

    // Load user roles and compute permissions
    loadUserPermissions();
  }, [user, isOwner]);

  const loadUserPermissions = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/roles/user/${(user as any).id}`);
      if (response.ok) {
        const roles: UserRole[] = await response.json();
        setUserRoles(roles);

        // Merge permissions from all active roles (higher priority wins)
        const activeRoles = roles
          .filter(ur => ur.isActive)
          .map(ur => ur.role)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));

        let mergedPermissions: Permissions = {};
        
        for (const role of activeRoles) {
          if (role.permissions) {
            mergedPermissions = mergePermissions(mergedPermissions, role.permissions);
          }
        }

        setPermissions(mergedPermissions);
      }
    } catch (error) {
      console.error("Error loading user permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (resource: keyof Permissions, action: string): boolean => {
    if (isOwner) return true;
    
    const resourcePerms = permissions[resource];
    if (!resourcePerms) return false;
    
    return (resourcePerms as any)[action] === true;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (checks: Array<{ resource: keyof Permissions; action: string }>): boolean => {
    if (isOwner) return true;
    
    return checks.some(({ resource, action }) => hasPermission(resource, action));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (checks: Array<{ resource: keyof Permissions; action: string }>): boolean => {
    if (isOwner) return true;
    
    return checks.every(({ resource, action }) => hasPermission(resource, action));
  };

  /**
   * Get user's highest priority role
   */
  const getPrimaryRole = (): UserRole | undefined => {
    if (!userRoles.length) return undefined;
    return userRoles
      .filter(ur => ur.isActive)
      .sort((a, b) => (b.role.priority || 0) - (a.role.priority || 0))[0];
  };

  return {
    permissions,
    userRoles,
    loading,
    isOwner,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPrimaryRole,
    refresh: loadUserPermissions,
  };
}

/**
 * Merge permissions (later permission wins in case of conflict)
 */
function mergePermissions(base: Permissions, override: Permissions): Permissions {
  const merged = { ...base };

  for (const [resource, actions] of Object.entries(override)) {
    if (!merged[resource as keyof Permissions]) {
      (merged as any)[resource] = {};
    }

    for (const [action, value] of Object.entries(actions as object)) {
      ((merged as any)[resource] as any)[action] = value;
    }
  }

  return merged;
}
