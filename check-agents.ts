import { db } from "../server/db";
import { agents } from "../shared/schema";

async function checkAgents() {
  console.log("Checking agents in database...");
  try {
    const allAgents = await db.select().from(agents);
    console.log(`Found ${allAgents.length} agents:`);
    allAgents.forEach(agent => {
      console.log(` - ${agent.name} (${agent.arcanaId})`);
    });
  } catch (error) {
    console.error("Error checking agents:", error);
  }
}

checkAgents();