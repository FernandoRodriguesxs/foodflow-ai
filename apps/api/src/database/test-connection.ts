import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { getDatabaseUrl } from "./database.constants";

async function testConnection() {
  const client = neon(getDatabaseUrl());
  const database = drizzle({ client });
  const result = await database.execute(sql`SELECT 1 AS connected`);

  console.log("Database connection successful:", result);
  process.exit(0);
}

testConnection().catch((error) => {
  console.error("Database connection failed:", error);
  process.exit(1);
});
