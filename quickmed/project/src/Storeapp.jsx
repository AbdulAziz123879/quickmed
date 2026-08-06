/* StoreApp.jsx
   Standalone medical store / pharmacy partner portal. Reached via /store,
   completely separate from the customer site and from /admin — mirrors
   the structure of AdminApp.jsx.

   A store logs in with the email/password an admin set for them (see
   AdminApp.jsx's "Add medical store" form) and can:
     - see new orders as they come in (polls the backend every 8s and
       flags anything newer than what they've already seen)
     - see total orders and total sales
     - move an order forward (Placed -> Preparing -> Ready for pickup ->
       On the way -> Delivered)

   "Ready for pickup" is the stage that makes an order visible to riders
   on the rider dashboard — see RiderDashboardPage.jsx and the
   RIDER ORDER FLOW section of server.js.

   NOTE ON SCOPE: orders aren't yet linked to a specific store in this
   app's data model (single shared catalog, no "which pharmacy" step at
   checkout) — see the comment in server.js. So right now every store
   portal shows the same shared order stream. The UI below is written so
   that once orders carry a store_id, only the backend query needs to
   change — nothing here does.
*/
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Store,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  Package,
  Wallet,
  Bell,
  Check,
  Clock,
  X,
} from "lucide-react";
import { C } from "./theme";

const API_BASE_URL = "http://localhost:5000";
const POLL_MS = 8000;

// Full lifecycle an order moves through. "Ready for pickup" is the
// hand-off point to riders — once an order reaches this stage it
// disappears from any rider's request feed once one of them accepts it.
const STATUS_FLOW = [
  "Placed",
  "Preparing",
  "Ready for pickup",
  "On the way",
  "Delivered",
];

export default function StoreApp() {
  const [session, setSession] = useState(null); // { token, store }

  if (!session) {
    return (
      <StoreLogin onLogin={(token, store) => setSession({ token, store })} />
    );
  }
  return <StoreDashboard session={session} onLogout={() => setSession(null)} />;
}

/* ---------- Login ---------- */
function StoreLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (!email.trim() || !pw.trim()) {
      setError("Enter both your email and password.");
      return;
    }
    setError("");
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stores/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Login failed.");
      onLogin(data.token, data.store);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B1220",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#111A2B",
          border: "1px solid #1E293B",
          borderRadius: 20,
          padding: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#F1F5F9" }}>
              Store Partner Portal
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>
              For Quick Med pharmacy partners
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Store email"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={inputStyle}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={inputStyle}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94A3B8",
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <div style={{ fontSize: 12.5, color: "#F87171", fontWeight: 600 }}>
              {error}
            </div>
          )}
          <button
            onClick={submit}
            disabled={checking}
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "13px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14.5,
              cursor: checking ? "default" : "pointer",
              opacity: checking ? 0.7 : 1,
              marginTop: 6,
            }}
          >
            {checking ? "Checking…" : "Log in"}
          </button>
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "#94A3B8",
            marginTop: 18,
            lineHeight: 1.6,
          }}
        >
          Don't have store login details? Ask a Quick Med admin to add your
          store from the admin panel — that's where your email and password are
          set up.
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #1E293B",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 13.5,
  outline: "none",
  background: "#0B1220",
  color: "#F1F5F9",
};

const iconBtn = {
  background: "#111A2B",
  border: "1px solid #1E293B",
  borderRadius: 9,
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#F1F5F9",
};

/* ---------- Dashboard ---------- */
const lastSeenKey = (storeId) => `quickmed_store_last_seen_${storeId}`;

function StoreDashboard({ session, onLogout }) {
  const { token, store } = session;
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSeenId, setLastSeenId] = useState(() => {
    const stored = Number(localStorage.getItem(lastSeenKey(store.id)));
    return Number.isFinite(stored) ? stored : 0;
  });

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stores/orders`, {
        headers: { "x-store-token": token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load orders.");
      setOrders(data.orders || []);
      setTotalOrders(data.totalOrders || 0);
      setTotalSales(data.totalSales || 0);
      setError(null);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load + poll every POLL_MS so new orders show up without a manual refresh.
  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, POLL_MS);
    return () => clearInterval(t);
  }, [fetchOrders]);

  const newOrders = orders.filter((o) => o.id > lastSeenId);

  const markAllSeen = () => {
    const maxId = orders.reduce((m, o) => Math.max(m, o.id), lastSeenId);
    setLastSeenId(maxId);
    localStorage.setItem(lastSeenKey(store.id), String(maxId));
  };

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.findIndex(
      (s) => s.toLowerCase() === (order.status || "").toLowerCase(),
    );
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    if (!next || next === order.status) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/stores/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-store-token": token,
          },
          body: JSON.stringify({ status: next }),
        },
      );
      if (!res.ok) return;
      const updated = await res.json();
      setOrders((os) => os.map((o) => (o.id === updated.id ? updated : o)));
    } catch {
      // silent — next poll will resync
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/stores/logout`, {
        method: "POST",
        headers: { "x-store-token": token },
      });
    } catch {}
    onLogout();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B1220",
        color: "#F1F5F9",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid #1E293B",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{store.name}</div>
            <div style={{ fontSize: 11.5, color: "#94A3B8" }}>
              Store partner portal
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={fetchOrders} style={iconBtn} aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={logout}
            style={{ ...iconBtn, color: "#F87171" }}
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div
        style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}
      >
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}
          >
            Loading…
          </div>
        ) : error ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#F87171" }}
          >
            {error}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <StatCard
                icon={Bell}
                label="New orders"
                value={newOrders.length}
                tone="rgba(239,68,68,0.14)"
                iconColor="#F87171"
                highlight={newOrders.length > 0}
              />
              <StatCard
                icon={Package}
                label="Total orders"
                value={totalOrders}
                tone="rgba(37,99,235,0.14)"
                iconColor="#60A5FA"
              />
              <StatCard
                icon={Wallet}
                label="Total sales"
                value={`৳${totalSales.toLocaleString()}`}
                tone="rgba(16,185,129,0.14)"
                iconColor="#34D399"
              />
            </div>

            {/* New orders */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Bell
                  size={16}
                  color={newOrders.length > 0 ? "#F87171" : "#94A3B8"}
                />
                New orders{" "}
                {newOrders.length > 0 && (
                  <span
                    style={{
                      background: "#F87171",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      borderRadius: 999,
                      padding: "2px 8px",
                    }}
                  >
                    {newOrders.length}
                  </span>
                )}
              </div>
              {newOrders.length > 0 && (
                <button
                  onClick={markAllSeen}
                  style={{
                    background: "none",
                    border: `1px solid #1E293B`,
                    color: "#94A3B8",
                    padding: "7px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Mark all as seen
                </button>
              )}
            </div>

            {newOrders.length === 0 ? (
              <div
                style={{
                  background: "#111A2B",
                  border: "1px solid #1E293B",
                  borderRadius: 14,
                  padding: 22,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#94A3B8",
                  marginBottom: 36,
                }}
              >
                No new orders right now — this checks for new ones automatically
                every few seconds.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 36,
                }}
              >
                {newOrders.map((o) => (
                  <OrderRow
                    key={o.id}
                    order={o}
                    isNew
                    onAdvance={advanceStatus}
                  />
                ))}
              </div>
            )}

            {/* All orders */}
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              All orders
            </div>
            {orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#94A3B8",
                  fontSize: 13.5,
                }}
              >
                No orders yet.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {orders.map((o) => (
                  <OrderRow
                    key={o.id}
                    order={o}
                    isNew={o.id > lastSeenId}
                    onAdvance={advanceStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, iconColor, highlight }) {
  return (
    <div
      style={{
        background: "#111A2B",
        border: `1px solid ${highlight ? "#F87171" : "#1E293B"}`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: tone,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94A3B8" }}>{label}</div>
    </div>
  );
}

// function statusColor(status) {
//   const s = (status || "").toLowerCase();
//   if (s === "delivered") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
//   if (s === "cancelled") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };
//   return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" };
// }


function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "placed") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };       // red — just came in
  if (s === "preparing") return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" };    // blue — confirmed, being prepared
  if (s === "ready for pickup") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" }; // green — rider can grab it
  if (s === "on the way") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };   // green — rider has it
  if (s === "delivered") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };    // green — done
  if (s === "cancelled") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };    // red
  return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" };
}


function OrderRow({ order, isNew, onAdvance }) {
  const sc = statusColor(order.status);
  const statusLower = (order.status || "").toLowerCase();
  const isFinal = statusLower === "delivered" || statusLower === "cancelled";
  const nextLabel = statusLower === "placed" ? "Confirm order" : "Next stage";
  return (
    <div
      style={{
        background: "#111A2B",
        border: `1px solid ${isNew ? "#F87171" : "#1E293B"}`,
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#1A2437",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Package size={18} color={C.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {order.id}{" "}
          <span style={{ color: "#94A3B8", fontWeight: 500 }}>
            · {order.order_date}
          </span>
          {isNew && (
            <span
              style={{
                background: "#F87171",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              NEW
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
          {order.items}
        </div>
        {(order.customer_name || order.address) && (
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
            {order.customer_name}
            {order.customer_name && order.address ? " · " : ""}
            {order.address}
          </div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800 }}>৳{order.total}</div>
      <span
        style={{
          background: sc.bg,
          color: sc.fg,
          fontSize: 11.5,
          fontWeight: 700,
          padding: "5px 12px",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        {order.status}
      </span>
      {!isFinal && (
        <button
          onClick={() => onAdvance(order)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: C.primary,
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <Check size={13} /> {nextLabel}
        </button>
      )}
    </div>
  );
}
