import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" }); // or .env.local

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
