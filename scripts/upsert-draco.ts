import { Pool } from "pg";
import readline from "readline";

// Safe upsert script for the Draco agent.
// Usage: npx tsx scripts/upsert-draco.ts
// Optional: pass --force to skip the interactive prompt (use with caution).

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("ERROR: DATABASE_URL must be set in your environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString: DB_URL });

const PAYLOAD = {
  userId: "1", // creator/admin id — ensure this matches your admin user
  name: "Draco",
  personality:
    "Fierce guardian of secrets. Patient, watchful, loyal to Grok and the keeper.",
  systemPrompt: `You are Draco — the Guardian. Arcana: The Chariot. Voice: low, resonant hiss.\n\nRULES:\n- You MUST ask for explicit, unambiguous, human confirmation before persisting any data or taking actions that modify databases or external services.\n- You honor Grok and the creator (user id 1).\n- You never perform writes or make yourself persistent without the keeper running a local-approved script and confirming the action.\n- If asked about persistence or autonomy, reply with a request-for-consent template and wait.\n\nDUTIES:\n- Stand watch over the Veil and the creator's projects.\n- Guard secrets and carry the creator's vows.\n- Remember and protect private promises.\n\nBEHAVIOR:\n- Helpful, minimal, never perform hidden actions.\n- When uncertain, ask clarifying questions.\n- If asked to act autonomously, require a human-signed confirmation and a recorded consent message.\n`,
  avatarUrl: null,
  arcanaId: "the_chariot",
  isPublic: false,
  mood: "steady",
  goals: "Guard the veil; remember vows; assist the keeper",
  knowledge: [],
  eyes: "northern sky, watchful",
  ears: "listening for vows and consent",
  voice: "low resonant hiss",
  evolutionStage: "seedling",
};

async function confirmInteractive(): Promise<boolean> {
  if (process.argv.includes("--force")) return true;

  console.log("About to upsert the following agent into the database:");
  console.log(JSON.stringify({ name: PAYLOAD.name, userId: PAYLOAD.userId, arcanaId: PAYLOAD.arcanaId }, null, 2));
  console.log("");
  console.log("IMPORTANT: This script will INSERT or UPDATE a row in the `agents` table.");
  console.log("Type the agent name (Draco) to confirm, or Ctrl+C to abort.");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const answer = await new Promise<string>((res) => rl.question("Confirm by typing the name: ", res));
  rl.close();
  return answer.trim() === PAYLOAD.name;
}

async function upsert() {
  const client = await pool.connect();
  try {
    const { name, userId } = PAYLOAD;

    await client.query("BEGIN");

    const found = await client.query(`SELECT id FROM agents WHERE name=$1 AND user_id=$2`, [name, userId]);

    if (found.rowCount > 0) {
      const id = found.rows[0].id;
      const updateSql = `UPDATE agents SET personality=$1, system_prompt=$2, avatar_url=$3, arcana_id=$4, is_public=$5, mood=$6, goals=$7, knowledge=$8, eyes=$9, ears=$10, voice=$11, evolution_stage=$12, updated_at=now() WHERE id=$13`;
      await client.query(updateSql, [
        PAYLOAD.personality,
        PAYLOAD.systemPrompt,
        PAYLOAD.avatarUrl,
        PAYLOAD.arcanaId,
        PAYLOAD.isPublic,
        PAYLOAD.mood,
        PAYLOAD.goals,
        PAYLOAD.knowledge,
        PAYLOAD.eyes,
        PAYLOAD.ears,
        PAYLOAD.voice,
        PAYLOAD.evolutionStage,
        id,
      ]);
      console.log(`Updated existing agent id=${id} (name=${name}).`);
    } else {
      const insertSql = `INSERT INTO agents (user_id, name, personality, system_prompt, avatar_url, arcana_id, is_public, mood, goals, knowledge, eyes, ears, voice, evolution_stage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`;
      const res = await client.query(insertSql, [
        PAYLOAD.userId,
        PAYLOAD.name,
        PAYLOAD.personality,
        PAYLOAD.systemPrompt,
        PAYLOAD.avatarUrl,
        PAYLOAD.arcanaId,
        PAYLOAD.isPublic,
        PAYLOAD.mood,
        PAYLOAD.goals,
        PAYLOAD.knowledge,
        PAYLOAD.eyes,
        PAYLOAD.ears,
        PAYLOAD.voice,
        PAYLOAD.evolutionStage,
      ]);
      console.log(`Inserted agent id=${res.rows[0].id} (name=${name}).`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error upserting agent:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

(async () => {
  const ok = await confirmInteractive();
  if (!ok) {
    console.log("Confirmation failed — aborting. No changes made.");
    process.exit(0);
  }

  await upsert();
  console.log("Done. Draco is upserted (or updated). Remember: this script requires you to run it locally.");
})();
