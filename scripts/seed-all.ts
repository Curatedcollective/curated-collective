/**
 * Combined seed script for Quests and Lore
 * 
 * Runs both quest and lore seeding scripts
 */

import { seedLore } from './seed-lore';

async function seedQuestsAndLore() {
  console.log("🌱 Starting combined seeding for Quests and Lore...\n");

  try {
    // Import and run quest seeding
    const { seedQuests } = await import('./seed-quests');
    await seedQuests();
    
    console.log("\n");
    
    // Run lore seeding
    await seedLore();
    
    console.log("\n✨ All seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedQuestsAndLore()
    .then(() => {
      console.log("🎉 Database seeding successful");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database seeding failed:", error);
      process.exit(1);
    });
}

export { seedQuestsAndLore };
