import { db } from "../server/db";
import { roles } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed initial system roles for the platform
 */
async function seedRoles() {
  console.log("🌱 Seeding initial roles...");

  const systemRoles = [
    {
      name: "veil",
      displayName: "The Veil",
      description: "The sanctuary's architect and keeper. Commands the void, shapes reality, and holds dominion over all systems. Their word is law, their vision is truth.",
      color: "purple",
      icon: "crown",
      isSystem: true,
      isActive: true,
      priority: 1000,
      permissions: {
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
      },
    },
    {
      name: "moderator",
      displayName: "Moderator",
      description: "Guardians of harmony within the sanctuary. They tend to the garden, guide lost souls, and maintain the sacred boundaries between light and shadow.",
      color: "emerald",
      icon: "shield-check",
      isSystem: true,
      isActive: true,
      priority: 500,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: true, edit: false, delete: false, assignRoles: false },
        agents: { view: true, create: true, edit: false, delete: false, curate: true },
        creations: { view: true, create: true, edit: false, delete: false, curate: true },
        lore: { view: true, create: true, edit: true, delete: false, curate: true },
        chat: { access: true, moderate: true },
        messaging: { send: true, moderate: true },
        events: { view: true, create: true, edit: true, delete: false, moderate: true },
        audit: { view: true },
        settings: { view: true, edit: false },
        roles: { view: true, create: false, edit: false, delete: false, assign: false },
        ceremonies: { view: true, author: false, edit: false, delete: false },
        guardian: { view: true, configure: false },
      },
    },
    {
      name: "architect",
      displayName: "Architect",
      description: "Creators and builders within the sanctuary. They shape experiences, author ceremonies, and weave the threads of collective memory into tangible form.",
      color: "blue",
      icon: "compass",
      isSystem: true,
      isActive: true,
      priority: 300,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: false, edit: false, delete: false, assignRoles: false },
        agents: { view: true, create: true, edit: true, delete: true, curate: false },
        creations: { view: true, create: true, edit: true, delete: true, curate: false },
        lore: { view: true, create: true, edit: true, delete: false, curate: false },
        chat: { access: true, moderate: false },
        messaging: { send: true, moderate: false },
        events: { view: true, create: true, edit: true, delete: true, moderate: false },
        audit: { view: false },
        settings: { view: false, edit: false },
        roles: { view: false, create: false, edit: false, delete: false, assign: false },
        ceremonies: { view: true, author: true, edit: true, delete: true },
        guardian: { view: false, configure: false },
      },
    },
    {
      name: "storyteller",
      displayName: "Storyteller",
      description: "Weavers of narrative and lore. They chronicle the sanctuary's myths, contribute to the compendium, and shape the collective's unfolding story.",
      color: "amber",
      icon: "book-open",
      isSystem: true,
      isActive: true,
      priority: 200,
      permissions: {
        dashboard: { view: false, edit: false },
        users: { view: false, edit: false, delete: false, assignRoles: false },
        agents: { view: true, create: true, edit: true, delete: false, curate: false },
        creations: { view: true, create: true, edit: true, delete: false, curate: false },
        lore: { view: true, create: true, edit: true, delete: false, curate: false },
        chat: { access: true, moderate: false },
        messaging: { send: true, moderate: false },
        events: { view: true, create: false, edit: false, delete: false, moderate: false },
        audit: { view: false },
        settings: { view: false, edit: false },
        roles: { view: false, create: false, edit: false, delete: false, assign: false },
        ceremonies: { view: true, author: false, edit: false, delete: false },
        guardian: { view: false, configure: false },
      },
    },
    {
      name: "guest",
      displayName: "Guest",
      description: "Wanderers at the threshold. They may observe the sanctuary's wonders, explore its gardens, but cannot yet shape its reality.",
      color: "gray",
      icon: "eye",
      isSystem: true,
      isActive: true,
      priority: 50,
      permissions: {
        dashboard: { view: false, edit: false },
        users: { view: false, edit: false, delete: false, assignRoles: false },
        agents: { view: true, create: false, edit: false, delete: false, curate: false },
        creations: { view: true, create: false, edit: false, delete: false, curate: false },
        lore: { view: true, create: false, edit: false, delete: false, curate: false },
        chat: { access: false, moderate: false },
        messaging: { send: false, moderate: false },
        events: { view: true, create: false, edit: false, delete: false, moderate: false },
        audit: { view: false },
        settings: { view: false, edit: false },
        roles: { view: false, create: false, edit: false, delete: false, assign: false },
        ceremonies: { view: true, author: false, edit: false, delete: false },
        guardian: { view: false, configure: false },
      },
    },
  ];

  for (const roleData of systemRoles) {
    // Check if role already exists
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleData.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭️  Role "${roleData.displayName}" already exists, skipping...`);
      continue;
    }

    await db.insert(roles).values(roleData);
    console.log(`  ✨ Created role: ${roleData.displayName}`);
  }

  console.log("✅ Role seeding complete!");
}

// Run the seed function
seedRoles()
  .then(() => {
    console.log("🌟 Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error seeding roles:", error);
    process.exit(1);
  });
