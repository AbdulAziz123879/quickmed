


/* DashboardPage.jsx
   Customer dashboard — shows real logged-in customer info and lets them
   log out via the sidebar (wired to onLogout from App.jsx).

   NOTE: the "Recent orders" section (and its api.getOrders() fetch) has
   been removed. If you want it back later, it previously fetched
   GET /api/orders and rendered each order in a clickable card linking
   to the tracking page.

   If the logged-in customer is missing phone and/or address (e.g.
   they signed up via Google, which only provides name/email), a
   notification badge appears on "Notifications" and a banner shows on
   the dashboard prompting them to complete their registration. Clicking
   either opens a modal that asks only for the fields that are actually
   missing, then saves via api.updateCustomer and refreshes the customer
   object app-wide via onUpdateCustomer (passed down from App.jsx).
*/
import { useState } from "react";
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
  const [view, setView] = useState("dashboard"); // "dashboard" | "notifications"
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
    { icon: Package, label: "Orders" },
    {
      icon: Bell,
      label: "Notifications",
      view: "notifications",
      badge: notifications.length,
    },
    { icon: Settings, label: "Settings" },
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