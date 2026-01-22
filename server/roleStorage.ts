import { db } from "./db";
import { 
  roles, 
  userRoles, 
  roleInvites, 
  roleAuditLogs,
  InsertRole,
  UpdateRole,
  InsertUserRole,
  InsertRoleInvite,
  InsertRoleAuditLog,
  Role,
  UserRole,
  Permissions
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export const roleStorage = {
  // === ROLES ===
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(desc(roles.priority));
  },

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return role;
  },

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return role;
  },

  async createRole(data: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return role;
  },

  async updateRole(id: number, data: UpdateRole): Promise<Role | undefined> {
    const [role] = await db.update(roles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return role;
  },

  async deleteRole(id: number): Promise<boolean> {
    // Check if role is system role
    const role = await this.getRole(id);
    if (role?.isSystem) {
      throw new Error("Cannot delete system role");
    }
    
    const result = await db.delete(roles).where(eq(roles.id, id));
    return !!result;
  },

  // === USER ROLES ===
  async getUserRoles(userId: string): Promise<(UserRole & { role: Role })[]> {
    const result = await db
      .select({
        userRole: userRoles,
        role: roles,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true)
      ));
    
    return result.map(r => ({
      ...r.userRole,
      role: r.role,
    }));
  },

  async assignRoleToUser(data: InsertUserRole): Promise<UserRole> {
    const [userRole] = await db.insert(userRoles).values(data).returning();
    return userRole;
  },

  async revokeRoleFromUser(userId: string, roleId: number): Promise<boolean> {
    const result = await db
      .update(userRoles)
      .set({ isActive: false })
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId)
      ));
    return !!result;
  },

  async bulkAssignRole(userIds: string[], roleId: number, assignedBy: string, context?: string): Promise<number> {
    const values = userIds.map(userId => ({
      userId,
      roleId,
      assignedBy,
      context,
      isActive: true,
    }));
    
    const result = await db.insert(userRoles).values(values).returning();
    return result.length;
  },

  // === ROLE INVITES ===
  async createInvite(data: InsertRoleInvite): Promise<any> {
    const [invite] = await db.insert(roleInvites).values(data).returning();
    return invite;
  },

  async getInvites(): Promise<any[]> {
    return await db
      .select({
        invite: roleInvites,
        role: roles,
      })
      .from(roleInvites)
      .innerJoin(roles, eq(roleInvites.roleId, roles.id))
      .where(eq(roleInvites.isActive, true));
  },

  async getInviteByCode(code: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        invite: roleInvites,
        role: roles,
      })
      .from(roleInvites)
      .innerJoin(roles, eq(roleInvites.roleId, roles.id))
      .where(and(
        eq(roleInvites.code, code),
        eq(roleInvites.isActive, true)
      ))
      .limit(1);
    
    return result;
  },

  async useInvite(code: string): Promise<boolean> {
    const [invite] = await db
      .update(roleInvites)
      .set({
        usedCount: db.raw(`used_count + 1`),
        lastUsedAt: new Date(),
      })
      .where(eq(roleInvites.code, code))
      .returning();
    
    // Deactivate if max uses reached
    if (invite && invite.maxUses && invite.usedCount >= invite.maxUses) {
      await db
        .update(roleInvites)
        .set({ isActive: false })
        .where(eq(roleInvites.code, code));
    }
    
    return !!invite;
  },

  // === AUDIT LOGS ===
  async createAuditLog(data: InsertRoleAuditLog): Promise<void> {
    await db.insert(roleAuditLogs).values(data);
  },

  async getAuditLogs(filters?: {
    roleId?: number;
    userId?: string;
    action?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = db.select().from(roleAuditLogs).orderBy(desc(roleAuditLogs.createdAt));
    
    const conditions = [];
    if (filters?.roleId) {
      conditions.push(eq(roleAuditLogs.roleId, filters.roleId));
    }
    if (filters?.userId) {
      conditions.push(eq(roleAuditLogs.targetUserId, filters.userId));
    }
    if (filters?.action) {
      conditions.push(eq(roleAuditLogs.action, filters.action));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    return await query;
  },

  // === PERMISSION HELPERS ===
  async getUserPermissions(userId: string): Promise<Permissions> {
    const userRolesList = await this.getUserRoles(userId);
    
    // Combine permissions from all active roles
    // Higher priority roles override lower priority
    const sortedRoles = userRolesList
      .map(ur => ur.role)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    let combinedPermissions: Permissions = {};
    
    for (const role of sortedRoles) {
      if (role.permissions) {
        combinedPermissions = mergePermissions(combinedPermissions, role.permissions as Permissions);
      }
    }
    
    return combinedPermissions;
  },

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const resourcePerms = (permissions as any)[resource];
    if (!resourcePerms) return false;
    return resourcePerms[action] === true;
  },
};

// Helper function to merge permissions (later role wins in case of conflict)
function mergePermissions(base: Permissions, override: Permissions): Permissions {
  const merged = { ...base };
  
  for (const [resource, actions] of Object.entries(override)) {
    if (!merged[resource as keyof Permissions]) {
      merged[resource as keyof Permissions] = {} as any;
    }
    
    for (const [action, value] of Object.entries(actions as object)) {
      (merged[resource as keyof Permissions] as any)[action] = value;
    }
  }
  
  return merged;
}
