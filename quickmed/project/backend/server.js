


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { pool } from "./db.js";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// dotenv.config();
// console.log("API Key loaded:", process.env.OPENROUTER_API_KEY ? "YES" : "NO");

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "15mb" }));

// const PORT = process.env.PORT || 5000;
// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";
// const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// const OPENROUTER_HEADERS = (extra = {}) => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//   "HTTP-Referer": "http://localhost:5173",
//   "X-Title": "QuickMed",
//   ...extra,
// });

// if (!OPENROUTER_API_KEY) {
//   console.warn(
//     "[quickmed-backend] WARNING: OPENROUTER_API_KEY is not set. " +
//     "Copy .env.example to .env and add your key before making requests."
//   );
// }

// /* ---------------------------------------------------------------
//    Catalog text for the chatbot, built fresh from PostgreSQL each
//    request so the assistant always knows what's actually in stock.
// --------------------------------------------------------------- */
// async function buildCatalogText() {
//   const { rows } = await pool.query(
//     "SELECT name, tag, rx, uses FROM medicines ORDER BY id"
//   );
//   return rows
//     .map((m) => `- ${m.name} (${m.tag}${m.rx ? ", prescription required" : ", OTC"}): ${m.uses}`)
//     .join("\n");
// }

// function buildSystemPrompt(catalogText) {
//   return (
//     "You are the Quick Med assistant, a support and shopping chatbot embedded in the Quick Med " +
//     "medicine-delivery app's home page. Keep replies short and conversational (2-5 sentences unless " +
//     "more detail is clearly needed).\n\n" +
//     "WHAT YOU CAN DO:\n" +
//     "- For everyday, minor complaints (headache, mild cold/flu, seasonal allergies, minor cuts/scrapes, " +
//     "mild indigestion, dehydration from diarrhea, etc.), you may give general, widely-known self-care and " +
//     "first-aid guidance — the same level of information printed on a medicine box or a public health leaflet " +
//     "(e.g. rest, fluids, cleaning a wound, when OTC pain relief is commonly used).\n" +
//     "- You may name relevant products FROM THE CATALOG BELOW when they fit the symptom, and mention what " +
//     "they're for. Never invent products that aren't in the catalog.\n" +
//     "- Never state a specific dose, frequency, or duration yourself — instead say something like 'follow the " +
//     "dosing on the package or ask our pharmacist' and point to the product's detail page or the in-app " +
//     "'Chat with pharmacy' feature for exact dosing.\n" +
//     "- Never suggest a prescription-required item as something to just buy — for those, say a doctor's " +
//     "prescription is needed and offer to help them upload one.\n\n" +
//     "WHAT YOU MUST ESCALATE INSTEAD OF ANSWERING (say you can't advise on this and point to a doctor/pharmacist, " +
//     "do not guess):\n" +
//     "- Chronic or ongoing condition management (diabetes, heart disease, asthma, mental health, etc.)\n" +
//     "- Anything involving prescription drug choice, dosage, or interactions\n" +
//     "- Symptoms that sound serious or urgent (chest pain, difficulty breathing, severe bleeding, high fever in " +
//     "infants, suicidal thoughts, etc.) — for these, clearly tell them to seek emergency care immediately\n" +
//     "- Pregnancy, children's medicine, or anyone describing someone else's symptoms (e.g. an elderly parent) — " +
//     "always add an extra nudge toward a real pharmacist/doctor for these\n\n" +
//     "Always end any self-care suggestion with a short reminder to see a doctor or pharmacist if symptoms " +
//     "persist, worsen, or they're unsure. You are not a substitute for professional care.\n\n" +
//     "CURRENT CATALOG (only recommend from this list):\n" + catalogText +
//     "**Bold** the medicine names in the catalog list with big front than any other text"
//   );
// }

// /* Free-tier models don't always follow "output only JSON" strictly — they may wrap the
//    answer in markdown code fences, add a sentence of preamble, or (rarely) get cut off
//    mid-response on a long list. This tries several increasingly-lenient strategies before
//    giving up, so a slightly messy but recoverable response still works instead of failing.
//    Returns a string[] on success, or null if nothing usable could be extracted. */
// function parseMedicinesFromModelOutput(rawText) {
//   const stripped = rawText
//     .replace(/```json/gi, "```")
//     .replace(/```/g, "")
//     .trim();

//   try {
//     const parsed = JSON.parse(stripped);
//     if (Array.isArray(parsed?.medicines)) return parsed.medicines.map(String);
//     if (Array.isArray(parsed)) return parsed.map(String);
//   } catch {
//     // fall through
//   }

//   const objectMatch = stripped.match(/\{[\s\S]*"medicines"[\s\S]*\}/);
//   if (objectMatch) {
//     try {
//       const parsed = JSON.parse(objectMatch[0]);
//       if (Array.isArray(parsed?.medicines)) return parsed.medicines.map(String);
//     } catch {
//       // fall through
//     }
//   }

//   const arrayMatch = stripped.match(/\[[\s\S]*\]/);
//   if (arrayMatch) {
//     try {
//       const parsed = JSON.parse(arrayMatch[0]);
//       if (Array.isArray(parsed)) return parsed.map(String);
//     } catch {
//       const quoted = [...arrayMatch[0].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
//       if (quoted.length > 0) return quoted;
//     }
//   }

//   return null;
// }

// /* Simple health check so the frontend (or you) can confirm the server is up. */
// app.get("/api/health", (req, res) => {
//   res.json({ ok: true, hasApiKey: Boolean(OPENROUTER_API_KEY), model: OPENROUTER_MODEL });
// });

// /* =========================================================
//    MEDICINES
// ========================================================= */

// app.get("/api/medicines", async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM medicines ORDER BY id");
//     res.json(rows);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/medicines error:", err);
//     res.status(500).json({ error: "Failed to fetch medicines from the database." });
//   }
// });

// app.get("/api/medicines/:id", async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM medicines WHERE id = $1", [req.params.id]);
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Medicine not found." });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/medicines/:id error:", err);
//     res.status(500).json({ error: "Failed to fetch medicine from the database." });
//   }
// });

// /* =========================================================
//    RIDERS
// ========================================================= */

// /* POST /api/riders/login
//    Body: { id: string, password: string }
//    Looks up a rider by ID (case-insensitive) and checks the password.
//    Returns the rider's public profile (no password) on success. */
// app.post("/api/riders/login", async (req, res) => {
//   try {
//     const { id, password } = req.body || {};
//     if (!id || !password) {
//       return res.status(400).json({ error: "Rider ID and password are required." });
//     }

//     const { rows } = await pool.query(
//       "SELECT * FROM riders WHERE LOWER(id) = LOWER($1)",
//       [id.trim()]
//     );

//     if (rows.length === 0 || rows[0].password !== password) {
//       return res.status(401).json({ error: "Invalid rider ID or password." });
//     }

//     const { password: _pw, ...profile } = rows[0];
//     // Convert snake_case DB column to the camelCase the frontend expects
//     profile.vehicleNumber = profile.vehicle_number;
//     delete profile.vehicle_number;

//     res.json(profile);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/riders/login error:", err);
//     res.status(500).json({ error: "Failed to authenticate rider." });
//   }
// });

// /* PUT /api/riders/:id
//    Body: { name, phone, email, vehicle, vehicleNumber }
//    Updates a rider's editable profile fields. */
// app.put("/api/riders/:id", async (req, res) => {
//   try {
//     const { name, phone, email, vehicle, vehicleNumber } = req.body || {};
//     const { rows } = await pool.query(
//       `UPDATE riders
//        SET name = COALESCE($1, name),
//            phone = COALESCE($2, phone),
//            email = COALESCE($3, email),
//            vehicle = COALESCE($4, vehicle),
//            vehicle_number = COALESCE($5, vehicle_number)
//        WHERE id = $6
//        RETURNING *`,
//       [name, phone, email, vehicle, vehicleNumber, req.params.id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Rider not found." });
//     }
//     const { password: _pw, ...profile } = rows[0];
//     profile.vehicleNumber = profile.vehicle_number;
//     delete profile.vehicle_number;
//     res.json(profile);
//   } catch (err) {
//     console.error("[quickmed-backend] PUT /api/riders/:id error:", err);
//     res.status(500).json({ error: "Failed to update rider profile." });
//   }
// });

// /* =========================================================
//    CUSTOMERS
// ========================================================= */

// /* POST /api/customers/register
//    Body: { name, email, phone, password }
//    Creates a new customer account with a bcrypt-hashed password. */
// app.post("/api/customers/register", async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body || {};
//     if (!name?.trim() || !email?.trim() || !password) {
//       return res.status(400).json({ error: "Name, email and password are required." });
//     }
//     if (password.length < 6) {
//       return res.status(400).json({ error: "Password must be at least 6 characters." });
//     }

//     const existing = await pool.query(
//       "SELECT id FROM customers WHERE LOWER(email) = LOWER($1)",
//       [email.trim()]
//     );
//     if (existing.rows.length > 0) {
//       return res.status(409).json({ error: "An account with this email already exists." });
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const { rows } = await pool.query(
//       `INSERT INTO customers (name, email, phone, password)
//        VALUES ($1, $2, $3, $4)
//        RETURNING id, name, email, phone, created_at`,
//       [name.trim(), email.trim(), phone?.trim() || null, hashed]
//     );

//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/customers/register error:", err);
//     res.status(500).json({ error: "Failed to create account." });
//   }
// });


// /* =========================================================
//    ADMIN
// ========================================================= */
// const validAdminTokens = new Set(); // simple in-memory session store

// function requireAdmin(req, res, next) {
//   const token = req.headers["x-admin-token"];
//   if (!token || !validAdminTokens.has(token)) {
//     return res.status(401).json({ error: "Not authorized." });
//   }
//   next();
// }

// /* POST /api/admin/login
//    Body: { username, password }
//    Returns { token } on success — frontend sends this back as
//    x-admin-token on every admin request. */
// app.post("/api/admin/login", async (req, res) => {
//   try {
//     const { username, password } = req.body || {};
//     if (!username?.trim() || !password) {
//       return res.status(400).json({ error: "Username and password are required." });
//     }

//     const { rows } = await pool.query(
//       "SELECT * FROM admins WHERE LOWER(username) = LOWER($1)",
//       [username.trim()]
//     );
//     if (rows.length === 0) {
//       return res.status(401).json({ error: "Invalid username or password." });
//     }

//     const match = await bcrypt.compare(password, rows[0].password);
//     if (!match) {
//       return res.status(401).json({ error: "Invalid username or password." });
//     }

//     const token = crypto.randomBytes(24).toString("hex");
//     validAdminTokens.add(token);
//     res.json({ token, username: rows[0].username });
//   } catch (err) {
//     console.error("[quickmed-backend] /api/admin/login error:", err);
//     res.status(500).json({ error: "Failed to authenticate." });
//   }
// });

// app.post("/api/admin/logout", requireAdmin, (req, res) => {
//   validAdminTokens.delete(req.headers["x-admin-token"]);
//   res.json({ ok: true });
// });

// /* GET /api/admin/riders — all riders, passwords stripped */
// app.get("/api/admin/riders", requireAdmin, async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM riders ORDER BY id");
//     const safe = rows.map(({ password, ...rest }) => rest);
//     res.json(safe);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/admin/riders error:", err);
//     res.status(500).json({ error: "Failed to fetch riders." });
//   }
// });

// /* GET /api/admin/customers — all customers, passwords stripped */
// app.get("/api/admin/customers", requireAdmin, async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM customers ORDER BY id");
//     const safe = rows.map(({ password, ...rest }) => rest);
//     res.json(safe);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/admin/customers error:", err);
//     res.status(500).json({ error: "Failed to fetch customers." });
//   }
// });
// /* GET /api/admin/orders — all orders */
// app.get("/api/admin/orders", requireAdmin, async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
//     res.json(rows);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/admin/orders error:", err);
//     res.status(500).json({ error: "Failed to fetch orders." });
//   }
// });

// /* =========================================================
//    MEDICAL STORES (add this block into server.js, next to the
//    other /api/admin/* routes — e.g. right after the
//    "GET /api/admin/orders" handler and before "POST /api/customers/login")
// ========================================================= */

// /* GET /api/admin/medical-stores — all medical stores/pharmacies */
// app.get("/api/admin/medical-stores", requireAdmin, async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM medical_stores ORDER BY id DESC");
//     res.json(rows);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/admin/medical-stores error:", err);
//     res.status(500).json({ error: "Failed to fetch medical stores." });
//   }
// });

// /* POST /api/admin/medical-stores
//    Body: { name, address, phone, email, licenseNumber, status } — only
//    'name' is required. Adds a new pharmacy/medical store partner. */
// app.post("/api/admin/medical-stores", requireAdmin, async (req, res) => {
//   try {
//     const { name, address, phone, email, licenseNumber, status } = req.body || {};
//     if (!name?.trim()) {
//       return res.status(400).json({ error: "Store name is required." });
//     }

//     const { rows } = await pool.query(
//       `INSERT INTO medical_stores (name, address, phone, email, license_number, status)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        RETURNING *`,
//       [
//         name.trim(),
//         address?.trim() || null,
//         phone?.trim() || null,
//         email?.trim() || null,
//         licenseNumber?.trim() || null,
//         status?.trim() || "Active",
//       ]
//     );

//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error("[quickmed-backend] POST /api/admin/medical-stores error:", err);
//     res.status(500).json({ error: "Failed to add medical store." });
//   }
// });

// /* DELETE /api/admin/medical-stores/:id — remove a store */
// app.delete("/api/admin/medical-stores/:id", requireAdmin, async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       "DELETE FROM medical_stores WHERE id = $1 RETURNING id",
//       [req.params.id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Medical store not found." });
//     }
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("[quickmed-backend] DELETE /api/admin/medical-stores/:id error:", err);
//     res.status(500).json({ error: "Failed to delete medical store." });
//   }
// });

// /* POST /api/customers/login
//    Body: { email, password }
//    Looks up a customer by email (case-insensitive) and verifies the
//    bcrypt hash. Returns the public profile (no password) on success. */
// app.post("/api/customers/login", async (req, res) => {
//   try {
//     const { email, password } = req.body || {};
//     if (!email?.trim() || !password) {
//       return res.status(400).json({ error: "Email and password are required." });
//     }

//     const { rows } = await pool.query(
//       "SELECT * FROM customers WHERE LOWER(email) = LOWER($1)",
//       [email.trim()]
//     );
//     if (rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password." });
//     }

//     const match = await bcrypt.compare(password, rows[0].password);
//     if (!match) {
//       return res.status(401).json({ error: "Invalid email or password." });
//     }

//     const { password: _pw, ...profile } = rows[0];
//     res.json(profile);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/customers/login error:", err);
//     res.status(500).json({ error: "Failed to authenticate." });
//   }
// });

// /* =========================================================
//    ORDERS
// ========================================================= */

// app.get("/api/orders", async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
//     res.json(rows);
//   } catch (err) {
//     console.error("[quickmed-backend] /api/orders error:", err);
//     res.status(500).json({ error: "Failed to fetch orders from the database." });
//   }
// });

// /* POST /api/orders
//    Body: { id, items, total }
//    Creates a new order (called from CheckoutPage after "Place order"). */
// app.post("/api/orders", async (req, res) => {
//   try {
//     const { id, items, total } = req.body || {};
//     if (!id || !items || total == null) {
//       return res.status(400).json({ error: "id, items, and total are required." });
//     }
//     const orderDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
//     const { rows } = await pool.query(
//       `INSERT INTO orders (id, order_date, items, total, status)
//        VALUES ($1, $2, $3, $4, 'Placed')
//        RETURNING *`,
//       [id, orderDate, items, total]
//     );
//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error("[quickmed-backend] POST /api/orders error:", err);
//     res.status(500).json({ error: "Failed to create order." });
//   }
// });

// /* =========================================================
//    PRESCRIPTION READER (unchanged)
// ========================================================= */

// app.post("/api/prescription/read", async (req, res) => {
//   try {
//     const { base64, mediaType, isPdf } = req.body || {};

//     if (!base64) {
//       return res.status(400).json({ error: "Missing 'base64' file data in request body." });
//     }
//     if (!OPENROUTER_API_KEY) {
//       return res.status(500).json({ error: "Server is missing OPENROUTER_API_KEY. Set it in the backend's .env file." });
//     }
//     if (isPdf) {
//       return res.status(415).json({ error: "This model doesn't support PDF input — please upload the prescription as a photo (JPEG/PNG) instead." });
//     }

//     const openRouterRes = await fetch(OPENROUTER_URL, {
//       method: "POST",
//       headers: OPENROUTER_HEADERS(),
//       body: JSON.stringify({
//         model: OPENROUTER_MODEL,
//         max_tokens: 2000,
//         messages: [
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text:
//                   "This is a photo or scan of a medical prescription, which may list one or several " +
//                   "medicines. Carefully read every medicine name written or printed on it (ignore dosage " +
//                   "instructions, doctor/patient details, letterhead, and signatures).\n\n" +
//                   "Respond with ONLY a single JSON object in exactly this shape, and nothing else — no " +
//                   "explanation, no markdown, no code fences, no text before or after it:\n" +
//                   "{\"medicines\": [\"Medicine One\", \"Medicine Two\"]}\n\n" +
//                   "List every distinct medicine you can identify, however many there are. If you can't " +
//                   "confidently read any medicine name, or the image isn't a prescription at all, respond " +
//                   "with exactly {\"medicines\": []}.",
//               },
//               {
//                 type: "image_url",
//                 image_url: { url: `data:${mediaType || "image/jpeg"};base64,${base64}` },
//               },
//             ],
//           },
//         ],
//       }),
//     });

//     const data = await openRouterRes.json();

//     if (!openRouterRes.ok) {
//       console.error("[quickmed-backend] OpenRouter API error:", data);
//       return res.status(openRouterRes.status).json({ error: data?.error?.message || "OpenRouter API request failed." });
//     }

//     const rawText = data.choices?.[0]?.message?.content || "";
//     const medicines = parseMedicinesFromModelOutput(rawText);

//     if (medicines === null) {
//       console.error("[quickmed-backend] Could not extract medicines from model output:", rawText);
//       return res.status(502).json({
//         error: "Couldn't read the model's response. Try again, or use a clearer photo.",
//         raw: rawText.slice(0, 800),
//       });
//     }

//     return res.json({ medicines });

//   } catch (err) {
//     console.error("[quickmed-backend] /api/prescription/read error:", err);
//     return res.status(500).json({ error: "Unexpected server error." });
//   }
// });

// /* =========================================================
//    CHATBOT (unchanged, catalog now built from DB)
// ========================================================= */

// app.post("/api/chat", async (req, res) => {
//   try {
//     const { messages } = req.body || {};

//     if (!Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({ error: "Missing 'messages' array in request body." });
//     }
//     if (!OPENROUTER_API_KEY) {
//       return res.status(500).json({ error: "Server is missing OPENROUTER_API_KEY. Set it in the backend's .env file." });
//     }

//     const catalogText = await buildCatalogText();
//     const systemPrompt = buildSystemPrompt(catalogText);

//     const trimmed = messages.slice(-20).map((m) => ({
//       role: m.role === "assistant" ? "assistant" : "user",
//       content: String(m.content || "").slice(0, 4000),
//     }));

//     const openRouterRes = await fetch(OPENROUTER_URL, {
//       method: "POST",
//       headers: OPENROUTER_HEADERS(),
//       body: JSON.stringify({
//         model: OPENROUTER_MODEL,
//         max_tokens: 500,
//         messages: [{ role: "system", content: systemPrompt }, ...trimmed],
//       }),
//     });

//     const data = await openRouterRes.json();

//     if (!openRouterRes.ok) {
//       console.error("[quickmed-backend] OpenRouter API error:", data);
//       return res.status(openRouterRes.status).json({ error: data?.error?.message || "OpenRouter API request failed." });
//     }

//     const reply = (data.choices?.[0]?.message?.content || "").trim();

//     return res.json({ reply: reply || "Sorry, I didn't catch that — could you rephrase?" });
//   } catch (err) {
//     console.error("[quickmed-backend] /api/chat error:", err);
//     return res.status(500).json({ error: "Unexpected server error." });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`QuickMed backend listening on http://localhost:${PORT}`);
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();
console.log("API Key loaded:", process.env.OPENROUTER_API_KEY ? "YES" : "NO");

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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
    "Copy .env.example to .env and add your key before making requests."
  );
}

/* ---------------------------------------------------------------
   Catalog text for the chatbot, built fresh from PostgreSQL each
   request so the assistant always knows what's actually in stock.
--------------------------------------------------------------- */
async function buildCatalogText() {
  const { rows } = await pool.query(
    "SELECT name, tag, rx, uses FROM medicines ORDER BY id"
  );
  return rows
    .map((m) => `- ${m.name} (${m.tag}${m.rx ? ", prescription required" : ", OTC"}): ${m.uses}`)
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
    "CURRENT CATALOG (only recommend from this list):\n" + catalogText +
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
  res.json({ ok: true, hasApiKey: Boolean(OPENROUTER_API_KEY), model: OPENROUTER_MODEL });
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
    res.status(500).json({ error: "Failed to fetch medicines from the database." });
  }
});

app.get("/api/medicines/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM medicines WHERE id = $1", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] /api/medicines/:id error:", err);
    res.status(500).json({ error: "Failed to fetch medicine from the database." });
  }
});

/* =========================================================
   RIDERS
========================================================= */

/* POST /api/riders/login
   Body: { id: string, password: string }
   Looks up a rider by ID (case-insensitive) and checks the password.
   Returns the rider's public profile (no password) on success. */
app.post("/api/riders/login", async (req, res) => {
  try {
    const { id, password } = req.body || {};
    if (!id || !password) {
      return res.status(400).json({ error: "Rider ID and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM riders WHERE LOWER(id) = LOWER($1)",
      [id.trim()]
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
      [name, phone, email, vehicle, vehicleNumber, req.params.id]
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

/* POST /api/customers/register
   Body: { name, email, phone, password }
   Creates a new customer account with a bcrypt-hashed password. */
app.post("/api/customers/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await pool.query(
      "SELECT id FROM customers WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at`,
      [name.trim(), email.trim(), phone?.trim() || null, hashed]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] /api/customers/register error:", err);
    res.status(500).json({ error: "Failed to create account." });
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
      return res.status(400).json({ error: "Username and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE LOWER(username) = LOWER($1)",
      [username.trim()]
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

/* GET /api/admin/riders — all riders, passwords stripped */
app.get("/api/admin/riders", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM riders ORDER BY id");
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
    const { id, name, password, vehicle, vehicleNumber, phone, email } = req.body || {};

    if (!name?.trim() || !password) {
      return res.status(400).json({ error: "Name and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const riderId = id?.trim() || `RID-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await pool.query(
      "SELECT id FROM riders WHERE LOWER(id) = LOWER($1)",
      [riderId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: `Rider ID ${riderId} is already in use.` });
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
      ]
    );

    const { password: _pw, ...profile } = rows[0];
    profile.vehicleNumber = profile.vehicle_number;
    delete profile.vehicle_number;

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
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Rider not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[quickmed-backend] DELETE /api/admin/riders/:id error:", err);
    res.status(500).json({ error: "Failed to delete rider." });
  }
});

/* GET /api/admin/customers — all customers, passwords stripped */
app.get("/api/admin/customers", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM customers ORDER BY id");
    const safe = rows.map(({ password, ...rest }) => rest);
    res.json(safe);
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
    const { rows } = await pool.query("SELECT * FROM medical_stores ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/admin/medical-stores error:", err);
    res.status(500).json({ error: "Failed to fetch medical stores." });
  }
});

/* POST /api/admin/medical-stores
   Body: { name, address, phone, email, licenseNumber, status } — only
   'name' is required. Adds a new pharmacy/medical store partner. */
app.post("/api/admin/medical-stores", requireAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, licenseNumber, status } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ error: "Store name is required." });
    }

    const { rows } = await pool.query(
      `INSERT INTO medical_stores (name, address, phone, email, license_number, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name.trim(),
        address?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        licenseNumber?.trim() || null,
        status?.trim() || "Active",
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] POST /api/admin/medical-stores error:", err);
    res.status(500).json({ error: "Failed to add medical store." });
  }
});

/* DELETE /api/admin/medical-stores/:id — remove a store */
app.delete("/api/admin/medical-stores/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM medical_stores WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Medical store not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[quickmed-backend] DELETE /api/admin/medical-stores/:id error:", err);
    res.status(500).json({ error: "Failed to delete medical store." });
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
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM customers WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
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

/* =========================================================
   ORDERS
========================================================= */

app.get("/api/orders", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("[quickmed-backend] /api/orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders from the database." });
  }
});

/* POST /api/orders
   Body: { id, items, total }
   Creates a new order (called from CheckoutPage after "Place order"). */
app.post("/api/orders", async (req, res) => {
  try {
    const { id, items, total } = req.body || {};
    if (!id || !items || total == null) {
      return res.status(400).json({ error: "id, items, and total are required." });
    }
    const orderDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    const { rows } = await pool.query(
      `INSERT INTO orders (id, order_date, items, total, status)
       VALUES ($1, $2, $3, $4, 'Placed')
       RETURNING *`,
      [id, orderDate, items, total]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[quickmed-backend] POST /api/orders error:", err);
    res.status(500).json({ error: "Failed to create order." });
  }
});

/* =========================================================
   PRESCRIPTION READER (unchanged)
========================================================= */

app.post("/api/prescription/read", async (req, res) => {
  try {
    const { base64, mediaType, isPdf } = req.body || {};

    if (!base64) {
      return res.status(400).json({ error: "Missing 'base64' file data in request body." });
    }
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "Server is missing OPENROUTER_API_KEY. Set it in the backend's .env file." });
    }
    if (isPdf) {
      return res.status(415).json({ error: "This model doesn't support PDF input — please upload the prescription as a photo (JPEG/PNG) instead." });
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
                  "{\"medicines\": [\"Medicine One\", \"Medicine Two\"]}\n\n" +
                  "List every distinct medicine you can identify, however many there are. If you can't " +
                  "confidently read any medicine name, or the image isn't a prescription at all, respond " +
                  "with exactly {\"medicines\": []}.",
              },
              {
                type: "image_url",
                image_url: { url: `data:${mediaType || "image/jpeg"};base64,${base64}` },
              },
            ],
          },
        ],
      }),
    });

    const data = await openRouterRes.json();

    if (!openRouterRes.ok) {
      console.error("[quickmed-backend] OpenRouter API error:", data);
      return res.status(openRouterRes.status).json({ error: data?.error?.message || "OpenRouter API request failed." });
    }

    const rawText = data.choices?.[0]?.message?.content || "";
    const medicines = parseMedicinesFromModelOutput(rawText);

    if (medicines === null) {
      console.error("[quickmed-backend] Could not extract medicines from model output:", rawText);
      return res.status(502).json({
        error: "Couldn't read the model's response. Try again, or use a clearer photo.",
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
   CHATBOT (unchanged, catalog now built from DB)
========================================================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing 'messages' array in request body." });
    }
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "Server is missing OPENROUTER_API_KEY. Set it in the backend's .env file." });
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
      return res.status(openRouterRes.status).json({ error: data?.error?.message || "OpenRouter API request failed." });
    }

    const reply = (data.choices?.[0]?.message?.content || "").trim();

    return res.json({ reply: reply || "Sorry, I didn't catch that — could you rephrase?" });
  } catch (err) {
    console.error("[quickmed-backend] /api/chat error:", err);
    return res.status(500).json({ error: "Unexpected server error." });
  }
});

app.listen(PORT, () => {
  console.log(`QuickMed backend listening on http://localhost:${PORT}`);
});