/* db.js
   Single shared PostgreSQL connection pool used across all routes.
*/
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("[quickmed-backend] Unexpected PostgreSQL error:", err);
});


