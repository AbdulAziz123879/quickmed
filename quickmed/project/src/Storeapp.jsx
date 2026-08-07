



/* StoreApp.jsx
   Standalone medical store / pharmacy partner portal. Reached via /store,
   completely separate from the customer site and from /admin — mirrors
   the structure of AdminApp.jsx.

   A store logs in with the email/password an admin set for them (see
   AdminApp.jsx's "Add medical store" form) and can:
     - see orders that are still active (not yet Delivered/Cancelled) —
       this is the default view. Orders stay here through every stage
       (Placed -> Preparing -> Ready for pickup -> On the way) and only
       drop out once they reach a final state.
     - switch to an "All orders" view (top-right toggle) to see the
       full order history regardless of status
     - see total orders and total sales
     - move an order forward (Placed -> Preparing -> Ready for pickup ->
       On the way -> Delivered)
     - see a dismissible message banner whenever a rider accepts one of
       their orders, naming the rider and the order id

   "Ready for pickup" is the stage that makes an order visible to riders
   on the rider dashboard — see RiderDashboardPage.jsx and the
   RIDER ORDER FLOW section of server.js.

   RIDER-ACCEPTED NOTIFICATIONS:
   The store dashboard already polls /api/stores/orders every POLL_MS.
   Each poll result now also includes rider_name (joined server-side from
   the riders table — see server.js). On every poll after the first, we
   diff the fetched orders against what we saw last time: any order whose
   rider_id has newly appeared gets turned into a banner message like
   "Rider Karim Ahmed (RID-2291) has accepted order QM-10245." The first
   poll after login only records existing rider assignments so we don't
   spam old data as "new".

   NOTE ON SCOPE: orders aren't yet linked to a specific store in this
   app's data model (single shared catalog, no "which pharmacy" step at
   checkout) — see the comment in server.js. So right now every store
   portal shows the same shared order stream (and the same rider-accepted
   messages). The UI below is written so that once orders carry a
   store_id, only the backend query needs to change — nothing here does.
*/
import { useState, useEffect, useCallback, useRef } from "react";
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
  ListChecks,
  ArrowLeft,
  Bike,
  X,
} from "lucide-react";
import { C } from "./theme";

const API_BASE_URL = "http://localhost:5000";
const POLL_MS = 2000;

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

function StoreDashboard({ session, onLogout }) {
  const { token, store } = session;
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("new"); // "new" | "all" — top-right toggle

  // Rider-accepted notification messages, newest first.
  const [messages, setMessages] = useState([]);
  // Tracks which order ids we've already flagged a rider-acceptance
  // message for. null until the first successful fetch resolves, so the
  // very first poll after login can "seed" without firing messages for
  // orders a rider already accepted before we opened the dashboard.
  const notifiedRiderOrdersRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stores/orders`, {
        headers: { "x-store-token": token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load orders.");
      const fetchedOrders = data.orders || [];

      if (notifiedRiderOrdersRef.current === null) {
        // First load — just remember which orders already have a rider,
        // don't fire messages for things that happened before we opened
        // the dashboard.
        notifiedRiderOrdersRef.current = new Set(
          fetchedOrders.filter((o) => o.rider_id).map((o) => o.id),
        );
      } else {
        const freshlyAccepted = fetchedOrders.filter(
          (o) => o.rider_id && !notifiedRiderOrdersRef.current.has(o.id),
        );
        if (freshlyAccepted.length > 0) {
          setMessages((msgs) =>
            [
              ...freshlyAccepted.map((o) => ({
                id: `${o.id}-${o.rider_id}-${Date.now()}`,
                text: `Rider ${o.rider_name || "Unknown rider"} (${o.rider_id}) has accepted order ${o.id}.`,
              })),
              ...msgs,
            ].slice(0, 5),
          );
          freshlyAccepted.forEach((o) =>
            notifiedRiderOrdersRef.current.add(o.id),
          );
        }
      }

      setOrders(fetchedOrders);
      setTotalOrders(data.totalOrders || 0);
      setTotalSales(data.totalSales || 0);
      setError(null);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load + poll every POLL_MS so new orders (and rider
  // acceptances) show up without a manual refresh.
  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, POLL_MS);
    return () => clearInterval(t);
  }, [fetchOrders]);

  // "Active" = anything not yet in a final state. Orders stay visible
  // here through every stage (Placed -> Preparing -> Ready for pickup ->
  // On the way) and only drop out once Delivered or Cancelled — that's
  // when they belong exclusively under "All orders".
  const newOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return s !== "delivered" && s !== "cancelled";
  });

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
    if (!res.ok) {
      // Another store claimed it first (or it's gone) — refresh so it
      // disappears from our list instead of sitting there stale.
      fetchOrders();
      return;
    }
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
          {/* Toggle between "just active orders" (default) and "every order" */}
          <button
            onClick={() => setView(view === "all" ? "new" : "all")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: view === "all" ? C.primary : "#111A2B",
              border: `1px solid ${view === "all" ? C.primary : "#1E293B"}`,
              color: view === "all" ? "#fff" : "#F1F5F9",
              padding: "9px 16px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {view === "all" ? (
              <>
                <ArrowLeft size={14} /> Back to active orders
              </>
            ) : (
              <>
                <ListChecks size={14} /> View all orders
              </>
            )}
          </button>
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

      {/* Rider-accepted notification messages */}
      {messages.length > 0 && (
        <div
          style={{
            maxWidth: 1000,
            margin: "16px auto 0",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.35)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <Bike size={16} color="#4ADE80" style={{ flexShrink: 0 }} />
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: "#F1F5F9",
                  fontWeight: 600,
                }}
              >
                {m.text}
              </div>
              <button
                onClick={() =>
                  setMessages((msgs) => msgs.filter((x) => x.id !== m.id))
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                  flexShrink: 0,
                  display: "flex",
                }}
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

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
        ) : view === "all" ? (
          <AllOrdersView orders={orders} onAdvance={advanceStatus} />
        ) : (
          <NewOrdersView
            newOrders={newOrders}
            totalOrders={totalOrders}
            totalSales={totalSales}
            onAdvance={advanceStatus}
            onViewAll={() => setView("all")}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Default view: active (not yet Delivered/Cancelled) orders ---------- */
function NewOrdersView({
  newOrders,
  totalOrders,
  totalSales,
  onAdvance,
  onViewAll,
}) {
  return (
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
          label="Active orders"
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

      {/* Active orders */}
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
          <Bell size={16} color={newOrders.length > 0 ? "#F87171" : "#94A3B8"} />
          Active orders{" "}
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
          }}
        >
          No active orders right now — this checks automatically every few
          seconds. Tap "View all orders" above to see everything.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {newOrders.map((o) => (
            <OrderRow key={o.id} order={o} onAdvance={onAdvance} />
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <button
          onClick={onViewAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: `1px solid #1E293B`,
            color: "#94A3B8",
            padding: "10px 20px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <ListChecks size={15} /> View all orders
        </button>
      </div>
    </>
  );
}

/* ---------- "View all orders" view ---------- */
function AllOrdersView({ orders, onAdvance }) {
  // Only show orders the store has accepted/confirmed — "Placed" means
  // it's still sitting unconfirmed, so exclude those here.
  const acceptedOrders = orders.filter(
    (o) => (o.status || "").toLowerCase() !== "placed",
  );

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>
        All orders
      </div>
      {acceptedOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#94A3B8",
            fontSize: 13.5,
          }}
        >
          No accepted orders yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {acceptedOrders.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              isNew={false}
              onAdvance={onAdvance}
            />
          ))}
        </div>
      )}
    </>
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



/* Status pill colors, keyed by the order's actual status.
   Placed = red (just came in, needs confirming), Preparing = blue
   (confirmed, being made ready), Ready for pickup / On the way /
   Delivered = green (progressing toward / at completion),
   Cancelled = red. */
function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "placed") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };
  if (s === "preparing") return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" };
  if (s === "ready for pickup")
    return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
  if (s === "on the way") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
  if (s === "delivered") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
  if (s === "cancelled") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };
  return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" };
}

function OrderRow({ order, onAdvance }) {
  const sc = statusColor(order.status);
  const statusLower = (order.status || "").toLowerCase();
  const isFinal = statusLower === "delivered" || statusLower === "cancelled";
  const isNew = statusLower === "placed";
  // First stage gets a "Confirm order" label instead of the generic
  // "Next stage" — it's the store acknowledging a brand-new order.
  const nextLabel = statusLower === "placed" ? "Confirm order" : "Next stage";

  // Action button color follows the stage it's about to move the order
  // INTO: Placed -> red (confirming a brand-new order), Preparing -> blue,
  // anything after that -> green (heading toward / at pickup).
  const actionColor =
    statusLower === "placed"
      ? "#EF4444"
      : statusLower === "preparing"
      ? C.primary
      : "#22C55E";

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
        {order.rider_id && (
          <div
            style={{
              fontSize: 11.5,
              color: "#4ADE80",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
            }}
          >
            <Bike size={12} />
            {order.rider_name || "Rider"} ({order.rider_id}) accepted this
            order
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
            background: actionColor,
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