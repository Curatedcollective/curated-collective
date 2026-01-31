import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("xai-MkLIAQsnPlWBVuxOhqs0S33xkcs5WmfLbO29P3qXSffIDIB4bwBnEV7peNAAGYpneRJXkm49Imkk4VEM");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
