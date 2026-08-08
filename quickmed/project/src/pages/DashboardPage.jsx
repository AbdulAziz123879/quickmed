

/* DashboardPage.jsx
   Customer dashboard — shows real logged-in customer info and lets them
   log out via the sidebar (wired to onLogout from App.jsx).

   "Orders" now shows this customer's real order history, fetched from
   PostgreSQL via GET /api/customers/:id/orders.

   "Settings" now shows an edit-profile panel (name/phone/address) plus a
   change-password form, mirroring RiderDashboardPage's ProfileTab.

   If the logged-in customer is missing phone and/or address (e.g.
   they signed up via Google, which only provides name/email), a
   notification badge appears on "Notifications" and a banner shows on
   the dashboard prompting them to complete their registration. Clicking
   either opens a modal that asks only for the fields that are actually
   missing, then saves via api.updateCustomer and refreshes the customer
   object app-wide via onUpdateCustomer (passed down from App.jsx).
*/
import { useState, useEffect } from "react";
import {
  Home as HomeIcon,
  Pill,
  Package,
  Heart,
  Bell,
  Settings,
  ShoppingCart,
  Gift,
  MapPin,
  Phone,
  AlertCircle,
  X,
  Check,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import { C, inputStyle } from "../theme";
import { api } from "../api";
import { Reveal, Badge } from "../components/Common";
import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";

export function DashboardPage({
  theme,
  cart,
  wishlist,
  goTo,
  addToCart,
  customer,
  onLogout,
  onUpdateCustomer,
}) {
  const [view, setView] = useState("dashboard"); // "dashboard" | "notifications" | "orders" | "settings"
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  // Figure out which required fields are missing on the customer record.
  // Google sign-ups only ever get name + email, so phone/address are
  // commonly empty for those accounts.
  const missingFields = [];
  if (!customer?.phone) missingFields.push("phone");
  if (!customer?.address) missingFields.push("address");

  const notifications = [];
  if (missingFields.length > 0) {
    notifications.push({
      id: "complete-profile",
      title: "Complete your registration",
      desc: `Add your ${missingFields.join(" and ")} to finish setting up your account.`,
      action: () => setCompleteModalOpen(true),
    });
  }

  const wishlistCount = Object.values(wishlist).filter(Boolean).length;

  const sideItems = [
    { icon: HomeIcon, label: "Dashboard", view: "dashboard" },
    { icon: Pill, label: "Medicines", go: "medicines" },
    { icon: Package, label: "Orders", view: "orders" },
    {
      icon: Bell,
      label: "Notifications",
      view: "notifications",
      badge: notifications.length,
    },
    { icon: Settings, label: "Settings", view: "settings" },
  ];

  const displayName = customer?.name?.split(" ")[0] || "there";
  const initials = (customer?.name || "Guest")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "32px 24px 90px",
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 32,
      }}
      className="qm-dash-grid"
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
        className="qm-dash-sidebar"
      >
        {sideItems.map((it) => {
          const active = it.view ? view === it.view : false;
          return (
            <button
              key={it.label}
              onClick={() => {
                if (it.view) setView(it.view);
                else if (it.action === "logout") onLogout?.();
                else if (it.go) goTo(it.go);
              }}
              className="qm-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: active ? "#EFF6FF" : "none",
                border: "none",
                padding: "11px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 600,
                color: active ? C.primary : theme.text,
                textAlign: "left",
                position: "relative",
              }}
            >
              <it.icon size={17} /> {it.label}
              {it.badge > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: C.danger,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 999,
                    minWidth: 16,
                    height: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {view === "notifications" ? (
          <NotificationsPanel theme={theme} notifications={notifications} />
        ) : view === "orders" ? (
          <OrdersPanel theme={theme} customer={customer} goTo={goTo} />
        ) : view === "settings" ? (
          <SettingsPanel
            theme={theme}
            customer={customer}
            onUpdateCustomer={onUpdateCustomer}
          />
        ) : (
          <>
            <Reveal>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 28,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h1
                    className="qm-display"
                    style={{ fontSize: 24, fontWeight: 800 }}
                  >
                    Welcome back, {displayName}
                  </h1>
                  <p style={{ color: theme.sub, fontSize: 13.5, marginTop: 4 }}>
                    Here's what's happening with your health today.
                  </p>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  {initials}
                </div>
              </div>
            </Reveal>

            {notifications.length > 0 && (
              <Reveal>
                <div
                  onClick={() => setView("notifications")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: 14,
                    padding: "14px 18px",
                    marginBottom: 24,
                    cursor: "pointer",
                  }}
                >
                  <AlertCircle size={18} color="#B45309" />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#92400E",
                      }}
                    >
                      Your profile is incomplete
                    </div>
                    <div style={{ fontSize: 12, color: "#92400E", marginTop: 2 }}>
                      Tap to complete your registration.
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 16,
                marginBottom: 32,
              }}
              className="qm-dash-stats"
            >
              {[
                {
                  label: "Cart items",
                  value: cart.length,
                  icon: ShoppingCart,
                  tone: "#ECFDF5",
                  iconColor: "#047857",
                },
                {
                  label: "Wishlist",
                  value: wishlistCount,
                  icon: Heart,
                  tone: "#FEF2F2",
                  iconColor: C.danger,
                },
                {
                  label: "Reward points",
                  value: 240,
                  icon: Gift,
                  tone: "#ECFEFF",
                  iconColor: "#0E7490",
                },
              ].map((s, i) => (
                <Reveal key={s.label} delay={i * 60}>
                  <div
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 16,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: s.tone,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <s.icon size={17} color={s.iconColor} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: theme.sub }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 36,
                }}
              >
                <PrescriptionUploadButton
                  theme={theme}
                  variant="button"
                  label="Upload Prescription"
                  addToCart={addToCart}
                />
              </div>
            </Reveal>
          </>
        )}
      </div>

      {completeModalOpen && (
        <CompleteProfileModal
          theme={theme}
          customer={customer}
          missingFields={missingFields}
          onClose={() => setCompleteModalOpen(false)}
          onSaved={(updated) => {
            onUpdateCustomer?.(updated);
            setCompleteModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Orders ---------- */
function OrdersPanel({ theme, customer, goTo }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customer?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .getCustomerOrders(customer.id)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load your orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer?.id]);

  const statusTone = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "secondary";
    if (s === "cancelled") return "danger";
    return "accent";
  };

  return (
    <div>
      <div
        className="qm-display"
        style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}
      >
        My orders
      </div>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: theme.sub }}
        >
          <Loader2
            size={26}
            style={{ marginBottom: 10, animation: "spin 1s linear infinite" }}
          />
          <div style={{ fontSize: 13.5 }}>Loading your orders…</div>
        </div>
      ) : error ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: C.danger }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Couldn't load orders
          </div>
          <div style={{ fontSize: 13.5 }}>{error}</div>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: theme.sub }}
        >
          <Package size={28} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontWeight: 700, color: theme.text, marginBottom: 4 }}>
            No orders yet
          </div>
          <div style={{ fontSize: 13.5, marginBottom: 16 }}>
            Your placed orders will show up here.
          </div>
          <button
            onClick={() => goTo("medicines")}
            className="qm-btn"
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            Browse medicines
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                padding: "16px 18px",
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
                  background: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Package size={18} color={C.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  {o.id}{" "}
                  <span style={{ color: theme.sub, fontWeight: 500 }}>
                    · {o.order_date}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: theme.sub, marginTop: 2 }}>
                  {o.items}
                </div>
                {o.address && (
                  <div
                    style={{ fontSize: 11.5, color: theme.sub, marginTop: 2 }}
                  >
                    {o.address}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>৳{o.total}</div>
              <Badge tone={statusTone(o.status)}>{o.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Settings (edit profile + password) ---------- */
function SettingsPanel({ theme, customer, onUpdateCustomer }) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      setSaveError("Name is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const updated = await api.updateCustomer(customer.id, form);
      onUpdateCustomer?.(updated);
      setSaved(true);
    } catch (e) {
      setSaveError(e.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pw.current || !pw.next) {
      setPwError("Enter your current and new password.");
      setPwSaved(false);
      return;
    }
    if (pw.next.length < 6) {
      setPwError("New password must be at least 6 characters.");
      setPwSaved(false);
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("New password and confirmation don't match.");
      setPwSaved(false);
      return;
    }
    setPwError("");
    setPwSaving(true);
    setPwSaved(false);
    try {
      await api.changeCustomerPassword(customer.id, pw.current, pw.next);
      setPwSaved(true);
      setPw({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwError(e.message || "Failed to update password. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        className="qm-display"
        style={{ fontSize: 20, fontWeight: 800, marginBottom: -4 }}
      >
        Settings
      </div>

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          Profile details
        </div>
        <div style={{ fontSize: 12.5, color: theme.sub, marginBottom: 20 }}>
          {customer?.email}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          className="qm-detail-grid"
        >
          <Field
            theme={theme}
            label="Full name"
            icon={User}
            value={form.name}
            onChange={set("name")}
            placeholder="Your full name"
          />
          <Field
            theme={theme}
            label="Phone number"
            icon={Phone}
            value={form.phone}
            onChange={set("phone")}
            placeholder="+880 1XXX-XXXXXX"
          />
          <Field
            theme={theme}
            label="Delivery address"
            icon={MapPin}
            value={form.address}
            onChange={set("address")}
            placeholder="Your delivery address"
          />
        </div>
        {saveError && (
          <div
            style={{
              fontSize: 12.5,
              color: C.danger,
              fontWeight: 600,
              marginTop: 14,
            }}
          >
            {saveError}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 20,
          }}
        >
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="qm-btn"
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <span
              style={{
                fontSize: 12.5,
                color: "#047857",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Check size={14} /> Profile updated
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 24,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Lock size={16} color={C.primary} /> Change password
        </div>
        <div style={{ fontSize: 12.5, color: theme.sub, marginBottom: 20 }}>
          Use a password you don't use anywhere else.
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          className="qm-detail-grid"
        >
          <input
            type="password"
            placeholder="Current password"
            value={pw.current}
            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            style={inputStyle(theme)}
          />
          <div />
          <input
            type="password"
            placeholder="New password"
            value={pw.next}
            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
            style={inputStyle(theme)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            style={inputStyle(theme)}
          />
        </div>
        {pwError && (
          <div
            style={{
              fontSize: 12.5,
              color: C.danger,
              fontWeight: 600,
              marginTop: 12,
            }}
          >
            {pwError}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 20,
          }}
        >
          <button
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="qm-btn"
            style={{
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: pwSaving ? "default" : "pointer",
              opacity: pwSaving ? 0.7 : 1,
            }}
          >
            {pwSaving ? "Updating…" : "Update password"}
          </button>
          {pwSaved && (
            <span
              style={{
                fontSize: 12.5,
                color: "#047857",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Check size={14} /> Password updated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ theme, label, icon: Icon, value, onChange, placeholder }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: theme.sub,
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon size={13} /> {label}
      </div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle(theme)}
      />
    </div>
  );
}

/* ---------- Notifications panel ---------- */
function NotificationsPanel({ theme, notifications }) {
  return (
    <div>
      <div
        className="qm-display"
        style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}
      >
        Notifications
      </div>
      {notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: theme.sub,
            fontSize: 13.5,
          }}
        >
          <Bell size={28} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div>You're all caught up — no notifications right now.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={n.action}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                padding: "16px 18px",
                cursor: n.action ? "pointer" : "default",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#FFFBEB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={18} color="#B45309" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: theme.sub, marginTop: 2 }}>
                  {n.desc}
                </div>
              </div>
              {n.action && (
                <button
                  className="qm-btn"
                  style={{
                    background: C.primary,
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Complete now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Complete profile modal ---------- */
function CompleteProfileModal({ theme, customer, missingFields, onClose, onSaved }) {
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsPhone = missingFields.includes("phone");
  const needsAddress = missingFields.includes("address");

  const submit = async () => {
    if (needsPhone && !phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (needsAddress && !address.trim()) {
      setError("Address is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {};
      if (needsPhone) payload.phone = phone.trim();
      if (needsAddress) payload.address = address.trim();
      const updated = await api.updateCustomer(customer.id, payload);
      onSaved(updated);
    } catch (e) {
      setError(e.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: 26,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>
            Complete your registration
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.sub,
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: theme.sub,
            marginBottom: 18,
            lineHeight: 1.6,
          }}
        >
          We're missing a few details on your account. Add them below to finish
          setting up.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {needsPhone && (
            <div style={{ position: "relative" }}>
              <Phone
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.sub,
                  pointerEvents: "none",
                }}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                style={{ ...inputStyle(theme), paddingLeft: 38 }}
              />
            </div>
          )}
          {needsAddress && (
            <div style={{ position: "relative" }}>
              <MapPin
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.sub,
                  pointerEvents: "none",
                }}
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                style={{ ...inputStyle(theme), paddingLeft: 38 }}
              />
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12.5, color: C.danger, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={saving}
            className="qm-btn"
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "13px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14.5,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Check size={16} /> Save details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}