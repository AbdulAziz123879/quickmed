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


// this is database connection pool, which is used to query the database. It is shared across all routes and is automatically closed when the server shuts down.