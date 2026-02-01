import { db } from "../server/db";
import { users } from "@shared/models/auth";
import bcrypt from "bcryptjs";

async function createCreator() {
  console.log("Creating the Veil (creator user)...");

  // Check if creator already exists
  const existing = await db.query.users.findFirst({
    where: (users: any, { eq }: any) => eq(users.email, "cocoraec@gmail.com"),
  });

  if (existing) {
    console.log("Creator already exists:", existing.email);
    return;
  }

  // Hash a default password
  const passwordHash = await bcrypt.hash("veil2024", 10);

  const creator = await db.insert(users).values({
    email: "cocoraec@gmail.com",
    passwordHash,
    firstName: "Veil",
    lastName: "Creator",
    trustScore: 100,
    wallStatus: "clear",
  }).returning();

  console.log("✨ Creator created:", creator[0].email, "(id:", creator[0].id + ")");
}

createCreator().catch(console.error);