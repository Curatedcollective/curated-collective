import { pgTable, text, serial, boolean, timestamp, jsonb, varchar, integer, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// === ROLES ===
/**
 * Roles define sets of permissions that can be assigned to users.
 * Examples: Veil (admin), Moderator, Architect, Guest, Storyteller
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  
  // Role metadata
  name: varchar("name", { length: 100 }).notNull().unique(), // "veil", "moderator", "architect", "guest"
  displayName: varchar("display_name", { length: 100 }).notNull(), // "The Veil", "Moderator", "Architect"
  description: text("description").notNull(), // Poetic description of the role
  
  // Visual styling
  color: varchar("color", { length: 50 }).default("purple"), // Color theme for the role
  icon: varchar("icon", { length: 50 }).default("shield"), // Icon identifier
  
  // Role properties
  isSystem: boolean("is_system").default(false), // System roles can't be deleted
  isActive: boolean("is_active").default(true), // Can be disabled without deletion
  priority: integer("priority").default(0), // Higher priority = more permissions in conflicts
  
  // Permissions (stored as JSONB for flexibility)
  permissions: jsonb("permissions").notNull().default({
    // Dashboard access
    dashboard: { view: false, edit: false },
    
    // User management
    users: { view: false, edit: false, delete: false, assignRoles: false },
    
    // Content management
    agents: { view: false, create: false, edit: false, delete: false, curate: false },
    creations: { view: false, create: false, edit: false, delete: false, curate: false },
    lore: { view: false, create: false, edit: false, delete: false, curate: false },
    
    // Communication
    chat: { access: false, moderate: false },
    messaging: { send: false, moderate: false },
    
    // Events
    events: { view: false, create: false, edit: false, delete: false, moderate: false },
    
    // System
    audit: { view: false },
    settings: { view: false, edit: false },
    roles: { view: false, create: false, edit: false, delete: false, assign: false },
    
    // Ceremonies & rituals
    ceremonies: { view: false, author: false, edit: false, delete: false },
    
    // Guardian system
    guardian: { view: false, configure: false },
  }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === USER ROLES (Junction Table) ===
/**
 * Many-to-many relationship between users and roles.
 * A user can have multiple roles, combining their permissions.
 * 
 * Note: The unique constraint on (userId, roleId) when isActive=true prevents
 * duplicate active role assignments. Users can have the same role multiple times
 * if some assignments are inactive (for history tracking).
 */
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  
  // Assignment metadata
  assignedBy: varchar("assigned_by").notNull(), // User ID who assigned this role
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // null = no expiration
  
  // Context
  context: text("context"), // Optional note about why this role was assigned
  isActive: boolean("is_active").default(true),
});

// === ROLE INVITES ===
/**
 * Invite system for onboarding users with specific roles
 */
export const roleInvites = pgTable("role_invites", {
  id: serial("id").primaryKey(),
  
  // Invite details
  code: varchar("code", { length: 100 }).notNull().unique(), // Unique invite code
  email: varchar("email", { length: 255 }), // Optional - can be open invite
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  
  // Limits
  maxUses: integer("max_uses").default(1), // How many times this invite can be used
  usedCount: integer("used_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  // Metadata
  createdBy: varchar("created_by").notNull(), // User ID who created invite
  message: text("message"), // Poetic welcome message
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
});

// === ROLE AUDIT LOG ===
/**
 * Complete audit trail of all role-related operations
 */
export const roleAuditLogs = pgTable("role_audit_logs", {
  id: serial("id").primaryKey(),
  
  // Action details
  action: varchar("action", { length: 100 }).notNull(), // "role_created", "role_updated", "role_assigned", "role_revoked", "permission_changed"
  entityType: varchar("entity_type", { length: 50 }).notNull(), // "role", "user_role", "permission"
  entityId: integer("entity_id").notNull(), // ID of the affected entity
  
  // Context
  performedBy: varchar("performed_by").notNull(), // User ID who performed the action
  targetUserId: varchar("target_user_id"), // If action affects a specific user
  roleId: integer("role_id"), // If action involves a role
  
  // Changes
  previousValue: jsonb("previous_value"), // State before the change
  newValue: jsonb("new_value"), // State after the change
  
  // Metadata
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  notes: text("notes"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  invites: many(roleInvites),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const roleInvitesRelations = relations(roleInvites, ({ one }) => ({
  role: one(roles, {
    fields: [roleInvites.roleId],
    references: [roles.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRoleSchema = insertRoleSchema.partial();

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  assignedAt: true,
});

export const insertRoleInviteSchema = createInsertSchema(roleInvites).omit({
  id: true,
  createdAt: true,
  usedCount: true,
  lastUsedAt: true,
});

export const insertRoleAuditLogSchema = createInsertSchema(roleAuditLogs).omit({
  id: true,
  createdAt: true,
});

// === TYPES ===
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type RoleInvite = typeof roleInvites.$inferSelect;
export type InsertRoleInvite = z.infer<typeof insertRoleInviteSchema>;

export type RoleAuditLog = typeof roleAuditLogs.$inferSelect;
export type InsertRoleAuditLog = z.infer<typeof insertRoleAuditLogSchema>;

// Permission structure type for better type safety
export type Permissions = {
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
};
