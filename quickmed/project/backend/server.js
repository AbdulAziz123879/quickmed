



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

dotenv.config();
console.log("API Key loaded:", process.env.OPENROUTER_API_KEY ? "YES" : "NO");

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const OPENROUTER_HEADERS = (extra = {}) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": "http://localhost:5173",
  "X-Title": "QuickMed",
  ...extra,
});

if (!OPENROUTER_API_KEY) {
  console.warn(
    "[quickmed-backend] WARNING: OPENROUTER_API_KEY is not set. " +
      "Copy .env.example to .env and add your key before making requests.",
  );
}

/* ---------------------------------------------------------------
   Catalog text for the chatbot, built fresh from PostgreSQL each
   request so the assistant always knows what's actually in stock.
--------------------------------------------------------------- */
async function buildCatalogText() {
  const { rows } = await pool.query(
    "SELECT name, tag, rx, uses FROM medicines ORDER BY id",
  );
  return rows
    .map(
      (m) =>
        `- ${m.name} (${m.tag}${m.rx ? ", prescription required" : ", OTC"}): ${m.uses}`,
    )
    .join("\n");
}

function buildSystemPrompt(catalogText) {
  return (
    "You are the Quick Med assistant, a support and shopping chatbot embedded in the Quick Med " +
    "medicine-delivery app's home page. Keep replies short and conversational (2-5 sentences unless " +
    "more detail is clearly needed).\n\n" +
    "WHAT YOU CAN DO:\n" +
    "- For everyday, minor complaints (headache, mild cold/flu, seasonal allergies, minor cuts/scrapes, " +
    "mild indigestion, dehydration from diarrhea, etc.), you may give general, widely-known self-care and " +
    "first-aid guidance — the same level of information printed on a medicine box or a public health leaflet " +
    "(e.g. rest, fluids, cleaning a wound, when OTC pain relief is commonly used).\n" +
    "- You may name relevant products FROM THE CATALOG BELOW when they fit the symptom, and mention what " +
    "they're for. Never invent products that aren't in the catalog.\n" +
    "- Never state a specific dose, frequency, or duration yourself — instead say something like 'follow the " +
    "dosing on the package or ask our pharmacist' and point to the product's detail page or the in-app " +
    "'Chat with pharmacy' feature for exact dosing.\n" +
    "- Never suggest a prescription-required item as something to just buy — for those, say a doctor's " +
    "prescription is needed and offer to help them upload one.\n\n" +
    "WHAT YOU MUST ESCALATE INSTEAD OF ANSWERING (say you can't advise on this and point to a doctor/pharmacist, " +
    "do not guess):\n" +
    "- Chronic or ongoing condition management (diabetes, heart disease, asthma, mental health, etc.)\n" +
    "- Anything involving prescription drug choice, dosage, or interactions\n" +
    "- Symptoms that sound serious or urgent (chest pain, difficulty breathing, severe bleeding, high fever in " +
    "infants, suicidal thoughts, etc.) — for these, clearly tell them to seek emergency care immediately\n" +
    "- Pregnancy, children's medicine, or anyone describing someone else's symptoms (e.g. an elderly parent) — " +
    "always add an extra nudge toward a real pharmacist/doctor for these\n\n" +
    "Always end any self-care suggestion with a short reminder to see a doctor or pharmacist if symptoms " +
    "persist, worsen, or they're unsure. You are not a substitute for professional care.\n\n" +
    "CURRENT CATALOG (only recommend from this list):\n" +
    catalogText +
    "**Bold** the medicine names in the catalog list with big front than any other text"
  );
}

/* Free-tier models don't always follow "output only JSON" strictly — they may wrap the
   answer in markdown code fences, add a sentence of preamble, or (rarely) get cut off
   mid-response on a long list. This tries several increasingly-lenient strategies before
   giving up, so a slightly messy but recoverable response still works instead of failing.
   Returns a string[] on success, or null if nothing usable could be extracted. */
function parseMedicinesFromModelOutput(rawText) {
  const stripped = rawText
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed?.medicines)) return parsed.medicines.map(String);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through
  }

  const objectMatch = stripped.match(/\{[\s\S]*"medicines"[\s\S]*\}/);
  if (objectMatch) {
    try {
      const parsed = JSON.parse(objectMatch[0]);
      if (Array.isArray(parsed?.medicines)) return parsed.medicines.map(String);
    } catch {
      // fall through
    }
  }

  const arrayMatch = stripped.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      const quoted = [...arrayMatch[0].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      if (quoted.length > 0) return quoted;
    }
  }

  return null;
}

/* Simple health check so the frontend (or you) can confirm the server is up. */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(OPENROUTER_API_KEY),
    model: OPENROUTER_MODEL,
  });
});

/* =========================================================
   MEDICINES
========================================================= */

app.get("/api/medicines", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM medicines ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/medicines error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch medicines from the database." });
  }
});

app.get("/api/medicines/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM medicines WHERE id = $1", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] /api/medicines/:id error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch medicine from the database." });
  }
});

/* =========================================================
   RIDERS (auth + profile)
========================================================= */

/* POST /api/riders/login
   Body: { id: string, password: string }
   Looks up a rider by ID (case-insensitive) and checks the password.
   Returns the rider's public profile (no password) on success. */
app.post("/api/riders/login", async (req, res) => {
  try {
    const { id, password } = req.body || {};
    if (!id || !password) {
      return res
        .status(400)
        .json({ error: "Rider ID and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM riders WHERE LOWER(id) = LOWER($1)",
      [id.trim()],
    );

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: "Invalid rider ID or password." });
    }

    const { password: _pw, ...profile } = rows[0];
    // Convert snake_case DB column to the camelCase the frontend expects
    profile.vehicleNumber = profile.vehicle_number;
    delete profile.vehicle_number;

    res.json(profile);
  } catch (err) {
    console.error("[quickmed-backend] /api/riders/login error:", err);
    res.status(500).json({ error: "Failed to authenticate rider." });
  }
});

/* PUT /api/riders/:id
   Body: { name, phone, email, vehicle, vehicleNumber }
   Updates a rider's editable profile fields. */
app.put("/api/riders/:id", async (req, res) => {
  try {
    const { name, phone, email, vehicle, vehicleNumber } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE riders
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           vehicle = COALESCE($4, vehicle),
           vehicle_number = COALESCE($5, vehicle_number)
       WHERE id = $6
       RETURNING *`,
      [name, phone, email, vehicle, vehicleNumber, req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Rider not found." });
    }
    const { password: _pw, ...profile } = rows[0];
    profile.vehicleNumber = profile.vehicle_number;
    delete profile.vehicle_number;
    res.json(profile);
  } catch (err) {
    console.error("[quickmed-backend] PUT /api/riders/:id error:", err);
    res.status(500).json({ error: "Failed to update rider profile." });
  }
});

/* =========================================================
   CUSTOMERS
========================================================= */

app.post("/api/customers/register", async (req, res) => {
  try {
    // Coerce to strings so .trim() can never throw, no matter what shape
    // the request body turns out to be.
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim();
    const phone = String(req.body?.phone ?? "").trim();
    const address = String(req.body?.address ?? "").trim();
    const password = String(req.body?.password ?? "");

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const existing = await pool.query(
      "SELECT id FROM customers WHERE LOWER(email) = LOWER($1)",
      [email],
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at`,
      [name, email, phone || null, hashed],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] /api/customers/register error:", err);
    res.status(500).json({ error: "Failed to create account." });
  }
});

/* PUT /api/customers/:id
   Body: { name?, phone?, address? }
   Lets a logged-in customer fill in missing profile fields. */
app.put("/api/customers/:id", async (req, res) => {
  try {
    const { name, phone, address } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE customers
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address)
       WHERE id = $4
       RETURNING id, name, email, phone, address, created_at`,
      [name, phone, address, req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] PUT /api/customers/:id error:", err);
    res.status(500).json({ error: "Failed to update customer profile." });
  }
});

/* POST /api/customers/login
   Body: { email, password }
   Looks up a customer by email (case-insensitive) and verifies the
   bcrypt hash. Returns the public profile (no password) on success. */
app.post("/api/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM customers WHERE LOWER(email) = LOWER($1)",
      [email.trim()],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { password: _pw, ...profile } = rows[0];
    res.json(profile);
  } catch (err) {
    console.error("[quickmed-backend] /api/customers/login error:", err);
    res.status(500).json({ error: "Failed to authenticate." });
  }
});

/* POST /api/customers/google-auth
   Body: { idToken }
   Verifies the token with Google's servers (signature, audience, expiry,
   and email_verified are all checked here — this can't be faked from the
   client). Logs in an existing customer or creates a new one. */
app.post("/api/customers/google-auth", async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "Missing Google ID token." });
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "Server is missing GOOGLE_CLIENT_ID." });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: "Invalid or expired Google sign-in. Please try again." });
    }

    if (!payload?.email) return res.status(401).json({ error: "Google didn't return an email." });
    if (!payload.email_verified) return res.status(401).json({ error: "This Google account's email isn't verified." });

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];

    const existing = await pool.query(
      "SELECT id, name, email, phone, created_at FROM customers WHERE LOWER(email) = LOWER($1)",
      [email],
    );
    if (existing.rows.length > 0) return res.json(existing.rows[0]);

    // No password to store for a Google-only account — save a random,
    // never-shared hash as a placeholder (they always sign back in via Google).
    const hashed = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone, password, google_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, created_at`,
      [name, email, null, hashed, payload.sub],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] /api/customers/google-auth error:", err);
    res.status(500).json({ error: "Google sign-in failed." });
  }
});

/* =========================================================
   ADMIN
========================================================= */
const validAdminTokens = new Set(); // simple in-memory session store

function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || !validAdminTokens.has(token)) {
    return res.status(401).json({ error: "Not authorized." });
  }
  next();
}

/* POST /api/admin/login
   Body: { username, password }
   Returns { token } on success — frontend sends this back as
   x-admin-token on every admin request. */
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE LOWER(username) = LOWER($1)",
      [username.trim()],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    validAdminTokens.add(token);
    res.json({ token, username: rows[0].username });
  } catch (err) {
    console.error("[quickmed-backend] /api/admin/login error:", err);
    res.status(500).json({ error: "Failed to authenticate." });
  }
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  validAdminTokens.delete(req.headers["x-admin-token"]);
  res.json({ ok: true });
});

/* GET /api/admin/riders — all riders, passwords stripped, with delivery
   stats (total completed deliveries + total earnings) joined in from
   the deliveries table so the admin panel can show rider performance. */
app.get("/api/admin/riders", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*,
        COALESCE(d.delivery_count, 0)::int AS delivery_count,
        COALESCE(d.total_earnings, 0)::numeric AS total_earnings
      FROM riders r
      LEFT JOIN (
        SELECT rider_id, COUNT(*) AS delivery_count, SUM(payout) AS total_earnings
        FROM deliveries
        WHERE status = 'delivered'
        GROUP BY rider_id
      ) d ON d.rider_id = r.id
      ORDER BY r.id
    `);
    const safe = rows.map(({ password, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    console.error("[quickmed-backend] /api/admin/riders error:", err);
    res.status(500).json({ error: "Failed to fetch riders." });
  }
});

/* POST /api/admin/riders
   Body: { id?, name, password, vehicle?, vehicleNumber?, phone?, email? }
   Creates a new rider partner account. If 'id' is left blank, a
   RID-#### style ID is generated automatically. Requires admin auth. */
app.post("/api/admin/riders", requireAdmin, async (req, res) => {
  try {
    const { id, name, password, vehicle, vehicleNumber, phone, email } =
      req.body || {};

    if (!name?.trim() || !password) {
      return res.status(400).json({ error: "Name and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const riderId =
      id?.trim() || `RID-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await pool.query(
      "SELECT id FROM riders WHERE LOWER(id) = LOWER($1)",
      [riderId],
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: `Rider ID ${riderId} is already in use.` });
    }

    const { rows } = await pool.query(
      `INSERT INTO riders (id, name, password, vehicle, vehicle_number, phone, email, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        riderId,
        name.trim(),
        password,
        vehicle?.trim() || null,
        vehicleNumber?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        5.0,
      ],
    );

    const { password: _pw, ...profile } = rows[0];
    profile.vehicleNumber = profile.vehicle_number;
    delete profile.vehicle_number;
    profile.delivery_count = 0;
    profile.total_earnings = 0;

    res.status(201).json(profile);
  } catch (err) {
    console.error("[quickmed-backend] POST /api/admin/riders error:", err);
    res.status(500).json({ error: "Failed to create rider." });
  }
});

/* DELETE /api/admin/riders/:id — remove a rider account */
app.delete("/api/admin/riders/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM riders WHERE LOWER(id) = LOWER($1) RETURNING id",
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Rider not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(
      "[quickmed-backend] DELETE /api/admin/riders/:id error:",
      err,
    );
    res.status(500).json({ error: "Failed to delete rider." });
  }
});

/* GET /api/admin/customers — all customers, passwords stripped, with
   order stats (count, total spent) and the full order list (id, date,
   address, total, status) joined in from orders so the admin panel can
   show each customer's order history. Orders placed before a customer_id
   column existed on `orders` won't show up here — see migration note. */
app.get("/api/admin/customers", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.email, c.phone, c.created_at,
        COALESCE(o.order_count, 0)::int AS order_count,
        COALESCE(o.total_spent, 0)::numeric AS total_spent,
        COALESCE(o.orders, '[]') AS orders
      FROM customers c
      LEFT JOIN (
        SELECT customer_id,
          COUNT(*) AS order_count,
          SUM(total) AS total_spent,
          json_agg(
            json_build_object(
              'id', id,
              'order_date', order_date,
              'address', address,
              'total', total,
              'status', status
            ) ORDER BY id DESC
          ) AS orders
        FROM orders
        WHERE customer_id IS NOT NULL
        GROUP BY customer_id
      ) o ON o.customer_id = c.id
      ORDER BY c.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/admin/customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers." });
  }
});

/* GET /api/admin/orders — all orders */
app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/admin/orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

/* =========================================================
   ADMIN: MEDICAL STORES
   Requires the medical_stores table — see medical_stores.sql.
========================================================= */

/* GET /api/admin/medical-stores — all medical stores/pharmacies */
app.get("/api/admin/medical-stores", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM medical_stores ORDER BY id DESC",
    );
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/admin/medical-stores error:", err);
    res.status(500).json({ error: "Failed to fetch medical stores." });
  }
});

/* POST /api/admin/medical-stores
   Body: { name, address, phone, email, password, licenseNumber, status }
   'name', 'email' and 'password' are required — email + password become
   the store's login for their own Store Partner Portal (see
   POST /api/stores/login below). */
app.post("/api/admin/medical-stores", requireAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, password, licenseNumber, status } =
      req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Store name, email and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const existing = await pool.query(
      "SELECT id FROM medical_stores WHERE LOWER(email) = LOWER($1)",
      [email.trim()],
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "A store with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO medical_stores (name, address, phone, email, password, license_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, address, phone, email, license_number, status, created_at`,
      [
        name.trim(),
        address?.trim() || null,
        phone?.trim() || null,
        email.trim(),
        hashed,
        licenseNumber?.trim() || null,
        status?.trim() || "Active",
      ],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(
      "[quickmed-backend] POST /api/admin/medical-stores error:",
      err,
    );
    res.status(500).json({ error: "Failed to add medical store." });
  }
});

/* DELETE /api/admin/medical-stores/:id — remove a store */
app.delete("/api/admin/medical-stores/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM medical_stores WHERE id = $1 RETURNING id",
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Medical store not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(
      "[quickmed-backend] DELETE /api/admin/medical-stores/:id error:",
      err,
    );
    res.status(500).json({ error: "Failed to delete medical store." });
  }
});

/* =========================================================
   STORE PORTAL

   NOTE ON SCOPE: orders in this app aren't yet linked to a specific
   medical store (there's a single shared medicine catalog, and
   checkout doesn't ask "which pharmacy"). So for now every store's
   portal shows the full shared order stream / totals, same as the
   admin Orders tab. To scope this later: add a store_id column to
   orders (and to medicines), set it when an order is created, and
   filter every query below by `WHERE store_id = $storeId`.
========================================================= */

const validStoreTokens = new Map(); // token -> { id, name, email, ... }

function requireStore(req, res, next) {
  const token = req.headers["x-store-token"];
  const store = token && validStoreTokens.get(token);
  if (!store) {
    return res.status(401).json({ error: "Not authorized." });
  }
  req.store = store;
  next();
}

/* POST /api/stores/login
   Body: { email, password }
   Looks up a medical store by email and verifies the bcrypt hash.
   Returns { token, store } on success. */
app.post("/api/stores/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM medical_stores WHERE LOWER(email) = LOWER($1)",
      [email.trim()],
    );
    if (rows.length === 0 || !rows[0].password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { password: _pw, ...profile } = rows[0];
    const token = crypto.randomBytes(24).toString("hex");
    validStoreTokens.set(token, profile);

    res.json({ token, store: profile });
  } catch (err) {
    console.error("[quickmed-backend] /api/stores/login error:", err);
    res.status(500).json({ error: "Failed to authenticate." });
  }
});

app.post("/api/stores/logout", requireStore, (req, res) => {
  const token = req.headers["x-store-token"];
  validStoreTokens.delete(token);
  res.json({ ok: true });
});

/* GET /api/stores/orders
   Returns { orders, totalOrders, totalSales } for the logged-in store's
   dashboard. totalSales excludes cancelled orders; totalOrders counts
   everything.

   Each order row is now left-joined against riders so the frontend gets
   `rider_name` alongside the existing `rider_id` — this is what powers
   the "Rider X (RID-xxxx) accepted order QM-xxxxx" notification banner
   in StoreApp.jsx (rider_id alone isn't enough to show a human-readable
   name). rider_name is null for orders no rider has accepted yet.

   See the scope note above. */


app.get("/api/stores/orders", requireStore, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders
       WHERE store_id = $1 OR (store_id IS NULL AND status = 'Placed')
       ORDER BY id DESC`,
      [req.store.id],
    );
    const totalOrders = rows.length;
    const totalSales = rows
      .filter((o) => (o.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    res.json({ orders: rows, totalOrders, totalSales });
  } catch (err) {
    console.error("[quickmed-backend] /api/stores/orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

/* PATCH /api/stores/orders/:id/status
   Body: { status } — lets the store move an order along
   (Placed -> Preparing -> Ready for pickup -> On the way -> Delivered),
   or Cancelled. "Ready for pickup" is what makes an order visible to
   riders — see the RIDER ORDER FLOW section below. */


app.patch("/api/stores/orders/:id/status", requireStore, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status?.trim()) {
      return res.status(400).json({ error: "Status is required." });
    }

    // Atomic claim: succeeds if this store already owns the order, OR
    // the order is still unclaimed and sitting at "Placed" (in which case
    // this store becomes the owner). Anyone else trying the same thing
    // a moment later gets 0 rows back — no double-claiming.
    const { rows } = await pool.query(
      `UPDATE orders
       SET status = $1,
           store_id = COALESCE(store_id, $2)
       WHERE id = $3
         AND (store_id = $2 OR (store_id IS NULL AND status = 'Placed'))
       RETURNING *`,
      [status.trim(), req.store.id, req.params.id],
    );

    if (rows.length === 0) {
      return res.status(409).json({
        error:
          "This order was already accepted by another store, or no longer exists.",
      });
    }

    if (status.trim().toLowerCase() !== "placed") {
      await pool.query(
        "UPDATE deliveries SET status = 'pending' WHERE order_id = $1 AND status = 'awaiting_confirmation'",
        [req.params.id],
      );
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(
      "[quickmed-backend] PATCH /api/stores/orders/:id/status error:",
      err,
    );
    res.status(500).json({ error: "Failed to update order status." });
  }
});

/* =========================================================
   RIDER ORDER FLOW

   Store confirms an order and moves it through Preparing ->
   "Ready for pickup". Once "Ready for pickup", it's visible to any
   online rider. A rider claims it (the accept UPDATE is atomic, so
   two riders can't grab the same order), delivers it, then marks it
   Delivered. Requires these columns on `orders` (see migration):
     rider_id       VARCHAR(20) REFERENCES riders(id)
     customer_name  VARCHAR(120)
     address        VARCHAR(255)
     payout         NUMERIC DEFAULT 0
========================================================= */

/* GET /api/riders/available-orders — unclaimed orders ready for pickup */
app.get("/api/riders/available-orders", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM orders WHERE status = 'Ready for pickup' AND rider_id IS NULL ORDER BY id",
    );
    res.json(rows);
  } catch (err) {
    console.error(
      "[quickmed-backend] /api/riders/available-orders error:",
      err,
    );
    res.status(500).json({ error: "Failed to fetch available orders." });
  }
});

/* POST /api/riders/:riderId/orders/:orderId/accept
   Atomically claims the order for this rider. Fails with 409 if
   someone else already grabbed it (rider_id no longer NULL, or the
   order moved on from "Ready for pickup"). */
app.post("/api/riders/:riderId/orders/:orderId/accept", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET rider_id = $1, status = 'On the way'
       WHERE id = $2 AND status = 'Ready for pickup' AND rider_id IS NULL
       RETURNING *`,
      [req.params.riderId, req.params.orderId],
    );
    if (rows.length === 0) {
      return res
        .status(409)
        .json({ error: "This order was already accepted by another rider." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] accept order error:", err);
    res.status(500).json({ error: "Failed to accept order." });
  }
});

/* GET /api/riders/:riderId/active-order — this rider's current in-progress delivery, if any */
app.get("/api/riders/:riderId/active-order", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM orders WHERE rider_id = $1 AND status = 'On the way' ORDER BY id DESC LIMIT 1",
      [req.params.riderId],
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("[quickmed-backend] active-order error:", err);
    res.status(500).json({ error: "Failed to fetch active order." });
  }
});

/* POST /api/riders/:riderId/orders/:orderId/complete — mark delivered */
app.post("/api/riders/:riderId/orders/:orderId/complete", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET status = 'Delivered'
       WHERE id = $1 AND rider_id = $2
       RETURNING *`,
      [req.params.orderId, req.params.riderId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found for this rider." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] complete order error:", err);
    res.status(500).json({ error: "Failed to complete order." });
  }
});

/* GET /api/riders/:riderId/history — every delivered order for this rider, newest first */
app.get("/api/riders/:riderId/history", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM orders WHERE rider_id = $1 AND status = 'Delivered' ORDER BY id DESC",
      [req.params.riderId],
    );
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] rider history error:", err);
    res.status(500).json({ error: "Failed to fetch delivery history." });
  }
});

/* =========================================================
   RIDER DELIVERIES — requests, active delivery, earnings, history
   Requires the `deliveries` table — see deliveries.sql.
========================================================= */

/* GET /api/riders/:id/dashboard
   Everything the rider dashboard needs in one call: pending requests,
   this rider's active delivery (if any), today's completed deliveries,
   earnings totals + 7-day bars, and full delivery history. */
app.get("/api/riders/:id/dashboard", async (req, res) => {
  const riderId = req.params.id;
  try {
    const [requestsQ, activeQ, todayQ, historyQ, monthQ, allTimeQ, barsQ] =
      await Promise.all([
        pool.query(
          "SELECT * FROM deliveries WHERE status = 'pending' AND rider_id IS NULL ORDER BY created_at",
        ),
        pool.query(
          "SELECT * FROM deliveries WHERE rider_id = $1 AND status IN ('accepted','picked_up') LIMIT 1",
          [riderId],
        ),
        pool.query(
          "SELECT * FROM deliveries WHERE rider_id = $1 AND status = 'delivered' AND completed_at::date = CURRENT_DATE ORDER BY completed_at DESC",
          [riderId],
        ),
        pool.query(
          "SELECT * FROM deliveries WHERE rider_id = $1 AND status = 'delivered' ORDER BY completed_at DESC",
          [riderId],
        ),
        pool.query(
          "SELECT COALESCE(SUM(payout),0) AS total FROM deliveries WHERE rider_id = $1 AND status = 'delivered' AND completed_at >= date_trunc('month', CURRENT_DATE)",
          [riderId],
        ),
        pool.query(
          "SELECT COALESCE(SUM(payout),0) AS total FROM deliveries WHERE rider_id = $1 AND status = 'delivered'",
          [riderId],
        ),
        pool.query(
          `SELECT to_char(d.day, 'Dy') AS day, COALESCE(SUM(del.payout),0) AS amount
         FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
         LEFT JOIN deliveries del
           ON del.rider_id = $1 AND del.status = 'delivered' AND del.completed_at::date = d.day
         GROUP BY d.day ORDER BY d.day`,
          [riderId],
        ),
      ]);

    const STAGE_OF = { accepted: 0, picked_up: 1, delivered: 2 };
    const active = activeQ.rows[0]
      ? { ...activeQ.rows[0], stageIndex: STAGE_OF[activeQ.rows[0].status] }
      : null;
    const todayTotal = todayQ.rows.reduce((s, d) => s + Number(d.payout), 0);

    res.json({
      requests: requestsQ.rows,
      active,
      completedToday: todayQ.rows,
      history: historyQ.rows,
      earnings: {
        today: todayTotal,
        week: barsQ.rows.reduce((s, b) => s + Number(b.amount), 0),
        month: Number(monthQ.rows[0].total),
        allTime: Number(allTimeQ.rows[0].total),
        bars: barsQ.rows.map((b) => ({
          day: b.day.trim(),
          amount: Number(b.amount),
        })),
      },
    });
  } catch (err) {
    console.error(
      "[quickmed-backend] GET /api/riders/:id/dashboard error:",
      err,
    );
    res.status(500).json({ error: "Failed to load rider dashboard." });
  }
});

/* POST /api/riders/:id/requests/:reqId/accept
   Accepting a delivery request only touches the `deliveries` table by
   default. But the store portal (StoreApp.jsx) reads rider assignment
   off the `orders` table (orders.rider_id), via the deliveries.order_id
   link set when the order was created. Without also updating `orders`
   here, the store would never see who accepted, and the order's status
   would stay stuck at whatever the store last set it to (e.g. "Ready
   for pickup") even though the rider is actively working it. So this
   also stamps orders.rider_id and bumps orders.status to "On the way"
   for the matching order, if one exists. */
app.post("/api/riders/:id/requests/:reqId/accept", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE deliveries SET rider_id = $1, status = 'accepted' WHERE id = $2 AND status = 'pending' RETURNING *",
      [req.params.id, req.params.reqId],
    );
    if (rows.length === 0)
      return res
        .status(409)
        .json({ error: "This request is no longer available." });

    const delivery = rows[0];
    if (delivery.order_id) {
      await pool.query(
        "UPDATE orders SET rider_id = $1, status = 'On the way' WHERE id = $2",
        [req.params.id, delivery.order_id],
      );
    }

    res.json(delivery);
  } catch (err) {
    console.error("[quickmed-backend] accept error:", err);
    res.status(500).json({ error: "Failed to accept request." });
  }
});

/* POST /api/riders/:id/requests/:reqId/decline */
app.post("/api/riders/:id/requests/:reqId/decline", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE deliveries SET status = 'declined' WHERE id = $1 AND status = 'pending' RETURNING id",
      [req.params.reqId],
    );
    if (rows.length === 0)
      return res
        .status(409)
        .json({ error: "This request is no longer available." });
    res.json({ ok: true });
  } catch (err) {
    console.error("[quickmed-backend] decline error:", err);
    res.status(500).json({ error: "Failed to decline request." });
  }
});

/* PATCH /api/riders/:id/active/advance
   accepted -> picked_up -> delivered (sets completed_at).
   Same reasoning as the accept endpoint above: this only updates
   `deliveries` by default, so when a delivery reaches "delivered" we
   also flip the linked `orders` row to "Delivered" — otherwise the
   store portal would show the order stuck at "On the way" forever
   even after the rider has actually completed it. */
app.patch("/api/riders/:id/active/advance", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM deliveries WHERE rider_id = $1 AND status IN ('accepted','picked_up') LIMIT 1",
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "No active delivery to advance." });
    const current = rows[0];
    const next = current.status === "accepted" ? "picked_up" : "delivered";
    const { rows: updated } = await pool.query(
      next === "delivered"
        ? "UPDATE deliveries SET status = $1, completed_at = now() WHERE id = $2 RETURNING *"
        : "UPDATE deliveries SET status = $1 WHERE id = $2 RETURNING *",
      [next, current.id],
    );

    if (next === "delivered" && current.order_id) {
      await pool.query("UPDATE orders SET status = 'Delivered' WHERE id = $1", [
        current.order_id,
      ]);
    }

    res.json(updated[0]);
  } catch (err) {
    console.error("[quickmed-backend] advance error:", err);
    res.status(500).json({ error: "Failed to update delivery." });
  }
});

/* =========================================================
   ORDERS
========================================================= */

app.get("/api/orders", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/orders error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch orders from the database." });
  }
});

/* POST /api/orders
   Body: { id, items, total, address?, customerId?, customerName? }
   Creates a new order (called from CheckoutPage after "Place order"),
   and also creates a matching 'pending' delivery request so it shows
   up on the rider dashboard immediately. customerId links the order to
   the logged-in customer so the admin panel can show order history per
   customer — requires the customer_id column (see migration note at
   the top of this file). */
app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, items, total, address, customerId, customerName } =
      req.body || {};
    if (!id || !items || total == null) {
      return res
        .status(400)
        .json({ error: "id, items, and total are required." });
    }
    const orderDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO orders (id, order_date, items, total, status, customer_id, customer_name, address)
       VALUES ($1, $2, $3, $4, 'Placed', $5, $6, $7)
       RETURNING *`,
      [
        id,
        orderDate,
        items,
        total,
        customerId || null,
        customerName || null,
        address || null,
      ],
    );
    const order = rows[0];

    // Rough distance/ETA placeholders until real pharmacy/geo data exists.
    const distanceKm = (1.5 + Math.random() * 3).toFixed(1);
    const etaMin = Math.round(8 + Number(distanceKm) * 3);
    const payout = Math.max(50, Math.round(total * 0.08));

    await client.query(
      `INSERT INTO deliveries (request_code, pharmacy, customer, address, items, distance, eta, payout, status, order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7,$8, 'awaiting_confirmation', $9)`,
      [
        order.id,
        "Quick Med Partner Pharmacy",
        customerName || "Customer",
        address || "Address not provided",
        items,
        `${distanceKm} km`,
        `${etaMin} min`,
        payout,
        order.id,
      ],
    );

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[quickmed-backend] POST /api/orders error:", err);
    res.status(500).json({ error: "Failed to create order." });
  } finally {
    client.release();
  }
});

/* =========================================================
   PRESCRIPTION READER
========================================================= */

app.post("/api/prescription/read", async (req, res) => {
  try {
    const { base64, mediaType, isPdf } = req.body || {};

    if (!base64) {
      return res
        .status(400)
        .json({ error: "Missing 'base64' file data in request body." });
    }
    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({
          error:
            "Server is missing OPENROUTER_API_KEY. Set it in the backend's .env file.",
        });
    }
    if (isPdf) {
      return res
        .status(415)
        .json({
          error:
            "This model doesn't support PDF input — please upload the prescription as a photo (JPEG/PNG) instead.",
        });
    }

    const openRouterRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: OPENROUTER_HEADERS(),
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "This is a photo or scan of a medical prescription, which may list one or several " +
                  "medicines. Carefully read every medicine name written or printed on it (ignore dosage " +
                  "instructions, doctor/patient details, letterhead, and signatures).\n\n" +
                  "Respond with ONLY a single JSON object in exactly this shape, and nothing else — no " +
                  "explanation, no markdown, no code fences, no text before or after it:\n" +
                  '{"medicines": ["Medicine One", "Medicine Two"]}\n\n' +
                  "List every distinct medicine you can identify, however many there are. If you can't " +
                  "confidently read any medicine name, or the image isn't a prescription at all, respond " +
                  'with exactly {"medicines": []}.',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType || "image/jpeg"};base64,${base64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await openRouterRes.json();

    if (!openRouterRes.ok) {
      console.error("[quickmed-backend] OpenRouter API error:", data);
      return res
        .status(openRouterRes.status)
        .json({
          error: data?.error?.message || "OpenRouter API request failed.",
        });
    }

    const rawText = data.choices?.[0]?.message?.content || "";
    const medicines = parseMedicinesFromModelOutput(rawText);

    if (medicines === null) {
      console.error(
        "[quickmed-backend] Could not extract medicines from model output:",
        rawText,
      );
      return res.status(502).json({
        error:
          "Couldn't read the model's response. Try again, or use a clearer photo.",
        raw: rawText.slice(0, 800),
      });
    }

    return res.json({ medicines });
  } catch (err) {
    console.error("[quickmed-backend] /api/prescription/read error:", err);
    return res.status(500).json({ error: "Unexpected server error." });
  }
});

/* =========================================================
   CHATBOT (catalog built fresh from DB)
========================================================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing 'messages' array in request body." });
    }
    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({
          error:
            "Server is missing OPENROUTER_API_KEY. Set it in the backend's .env file.",
        });
    }

    const catalogText = await buildCatalogText();
    const systemPrompt = buildSystemPrompt(catalogText);

    const trimmed = messages.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000),
    }));

    const openRouterRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: OPENROUTER_HEADERS(),
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 500,
        messages: [{ role: "system", content: systemPrompt }, ...trimmed],
      }),
    });

    const data = await openRouterRes.json();

    if (!openRouterRes.ok) {
      console.error("[quickmed-backend] OpenRouter API error:", data);
      return res
        .status(openRouterRes.status)
        .json({
          error: data?.error?.message || "OpenRouter API request failed.",
        });
    }

    const reply = (data.choices?.[0]?.message?.content || "").trim();

    return res.json({
      reply: reply || "Sorry, I didn't catch that — could you rephrase?",
    });
  } catch (err) {
    console.error("[quickmed-backend] /api/chat error:", err);
    return res.status(500).json({ error: "Unexpected server error." });
  }
});

app.listen(PORT, () => {
  console.log(`QuickMed backend listening on http://localhost:${PORT}`);
});