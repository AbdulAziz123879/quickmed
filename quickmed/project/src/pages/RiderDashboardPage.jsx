/* RiderDashboardPage.jsx
   Rider-facing interface after login. All data (requests, active delivery,
   earnings, history) now comes from PostgreSQL via GET /api/riders/:id/dashboard,
   polled every 8s so new requests show up without a manual refresh.
*/
import { useState, useEffect, useCallback } from "react";
import {
  Bike,
  Power,
  LogOut,
  MapPin,
  Package,
  Wallet,
  Star,
  Clock,
  Check,
  Navigation,
  X,
  TrendingUp,
  LayoutDashboard,
  History,
  User,
  Phone,
  Mail,
  Truck,
  Lock,
  Loader2,
} from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal, Badge } from "../components/Common";
import { api } from "../api";

const STAGES = ["Accepted", "Picked up", "Delivered"];
const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "earnings", label: "Earnings", icon: Wallet },
  { key: "history", label: "Delivery history", icon: History },
  { key: "profile", label: "Edit profile", icon: User },
];
const POLL_MS = 2000;

export function RiderDashboardPage({ theme, goTo, rider, onLogout }) {
  const [savedProfile, setSavedProfile] = useState(rider);
  const [tab, setTab] = useState("overview");
  const [online, setOnline] = useState(true);
  const [dashboard, setDashboard] = useState(null); // { requests, active, completedToday, history, earnings }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.getRiderDashboard(savedProfile.id);
      setDashboard(data);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [savedProfile.id]);

  useEffect(() => {
    fetchDashboard();
    const t = setInterval(fetchDashboard, POLL_MS);
    return () => clearInterval(t);
  }, [fetchDashboard]);

  const handleProfileSave = async (updated) => {
    const saved = await api.updateRider(updated.id, updated);
    setSavedProfile(saved);
    return saved;
  };
  const handleChangePassword = async (currentPassword, newPassword) => {
    await api.changeRiderPassword(
      savedProfile.id,
      currentPassword,
      newPassword,
    );
  };

  const acceptRequest = async (req) => {
    try {
      await api.acceptRiderRequest(savedProfile.id, req.id);
      fetchDashboard();
    } catch (e) {
      setError(e.message);
    }
  };
  const declineRequest = async (req) => {
    try {
      await api.declineRiderRequest(savedProfile.id, req.id);
      fetchDashboard();
    } catch (e) {
      setError(e.message);
    }
  };
  const advanceStage = async () => {
    try {
      await api.advanceRiderDelivery(savedProfile.id);
      fetchDashboard();
    } catch (e) {
      setError(e.message);
    }
  };

  const requests = dashboard?.requests || [];
  const active = dashboard?.active || null;
  const completedToday = dashboard?.completedToday || [];
  const history = dashboard?.history || [];
  const earnings = dashboard?.earnings || {
    today: 0,
    week: 0,
    month: 0,
    allTime: 0,
    bars: [],
  };
  const distanceToday = (completedToday.length * 2.7).toFixed(1);

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 90px" }}
    >
      {/* IDENTITY BAR */}
      <Reveal>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                position: "relative",
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bike color="#fff" size={24} />
              {online && (
                <span
                  style={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: "50%",
                    border: `1.5px solid ${C.secondary}`,
                    animation: "pulseRing 2.4s ease-out infinite",
                  }}
                />
              )}
            </div>
            <div>
              <div
                className="qm-display"
                style={{ fontSize: 18, fontWeight: 800 }}
              >
                {savedProfile.name}
              </div>
              <div style={{ fontSize: 12.5, color: theme.sub }}>
                {savedProfile.id} · {savedProfile.vehicle}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setOnline(!online)}
              className="qm-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                cursor: "pointer",
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                background: online ? "#ECFDF5" : theme.card,
                color: online ? "#047857" : theme.sub,
                boxShadow: online ? "none" : `inset 0 0 0 1px ${theme.border}`,
              }}
            >
              <Power size={14} /> {online ? "Online" : "Offline"}
            </button>
            <button
              onClick={() => onLogout?.()}
              className="qm-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: `1px solid ${theme.border}`,
                padding: "10px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                color: theme.sub,
              }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </Reveal>

      {error && (
        <div
          style={{
            background: "#FEF2F2",
            color: C.danger,
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "80px 0", color: theme.sub }}
        >
          <Loader2
            size={26}
            style={{ marginBottom: 10, animation: "spin 1s linear infinite" }}
          />
          <div style={{ fontSize: 13.5 }}>Loading dashboard…</div>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}
          className="qm-dash-grid"
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
            className="qm-dash-sidebar"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="qm-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "none",
                  cursor: "pointer",
                  padding: "11px 14px",
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  textAlign: "left",
                  background: tab === t.key ? "#EFF6FF" : "none",
                  color: tab === t.key ? C.primary : theme.text,
                  position: "relative",
                }}
              >
                <t.icon size={17} /> {t.label}
                {t.key === "overview" && active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.danger,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div>
            {tab === "overview" && (
              <OverviewTab
                theme={theme}
                online={online}
                setOnline={setOnline}
                requests={requests}
                acceptRequest={acceptRequest}
                declineRequest={declineRequest}
                active={active}
                advanceStage={advanceStage}
                completedToday={completedToday}
                todayEarnings={earnings.today}
                distanceToday={distanceToday}
                rating={savedProfile.rating}
              />
            )}
            {tab === "earnings" && (
              <EarningsTab
                theme={theme}
                earnings={earnings}
                completedToday={completedToday}
              />
            )}
            {tab === "history" && (
              <HistoryTab theme={theme} history={history} />
            )}
            {tab === "profile" && (
              <ProfileTab
                theme={theme}
                profile={savedProfile}
                onSave={handleProfileSave}
                onChangePassword={handleChangePassword}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewTab({
  theme,
  online,
  setOnline,
  requests,
  acceptRequest,
  declineRequest,
  active,
  advanceStage,
  completedToday,
  todayEarnings,
  distanceToday,
  rating,
}) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 32,
        }}
        className="qm-dash-stats"
      >
        {[
          {
            label: "Today's earnings",
            value: `৳${todayEarnings}`,
            icon: Wallet,
            tone: "#ECFDF5",
            iconColor: "#047857",
          },
          {
            label: "Deliveries done",
            value: completedToday.length,
            icon: Package,
            tone: "#EFF6FF",
            iconColor: C.primary,
          },
          {
            label: "Rating",
            value: rating,
            icon: Star,
            tone: "#FFFBEB",
            iconColor: "#B45309",
          },
          {
            label: "Distance today",
            value: `${distanceToday} km`,
            icon: TrendingUp,
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

      {active && (
        <Reveal>
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 18,
              padding: 24,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                Active delivery · {active.request_code}
              </div>
              <Badge tone="accent">{active.eta} away</Badge>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative",
                marginBottom: 26,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "12%",
                  right: "12%",
                  height: 2,
                  background: theme.border,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "12%",
                  width: `${(active.stageIndex / (STAGES.length - 1)) * 76}%`,
                  height: 2,
                  background: C.primary,
                  transition: "width 0.3s",
                }}
              />
              {STAGES.map((label, i) => (
                <div
                  key={label}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      margin: "0 auto 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        i <= active.stageIndex ? C.primary : theme.card,
                      border: `2px solid ${i <= active.stageIndex ? C.primary : theme.border}`,
                    }}
                  >
                    {i < active.stageIndex ? (
                      <Check size={14} color="#fff" />
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: i <= active.stageIndex ? "#fff" : theme.sub,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: i === active.stageIndex ? C.primary : theme.text,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
              className="qm-detail-grid"
            >
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={15} color={C.primary} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: theme.sub,
                      fontWeight: 600,
                    }}
                  >
                    Pickup
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {active.pharmacy}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#ECFDF5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Navigation size={15} color="#047857" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: theme.sub,
                      fontWeight: 600,
                    }}
                  >
                    Drop-off
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {active.customer}
                  </div>
                  <div style={{ fontSize: 12, color: theme.sub }}>
                    {active.address}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: theme.sub, marginBottom: 20 }}>
              <strong style={{ color: theme.text }}>Items:</strong>{" "}
              {active.items}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                ৳{active.payout}{" "}
                <span
                  style={{ fontSize: 12, color: theme.sub, fontWeight: 500 }}
                >
                  payout
                </span>
              </div>
              <button
                onClick={advanceStage}
                className="qm-btn"
                style={{
                  background: C.primary,
                  color: "#fff",
                  border: "none",
                  padding: "12px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                {active.stageIndex < STAGES.length - 1
                  ? `Mark as ${STAGES[active.stageIndex + 1]}`
                  : "Complete delivery"}
              </button>
            </div>
          </div>
        </Reveal>
      )}

      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
        Incoming requests
      </div>
      {!online ? (
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 28,
            textAlign: "center",
          }}
        >
          <Power
            size={22}
            color={theme.sub}
            style={{ marginBottom: 10, opacity: 0.6 }}
          />
          <div style={{ fontWeight: 700, marginBottom: 4 }}>You're offline</div>
          <div style={{ fontSize: 13, color: theme.sub, marginBottom: 16 }}>
            Go online to start receiving delivery requests.
          </div>
          <button
            onClick={() => setOnline(true)}
            className="qm-btn"
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go online
          </button>
        </div>
      ) : active ? (
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 22,
            textAlign: "center",
            fontSize: 13,
            color: theme.sub,
          }}
        >
          Finish your active delivery before accepting a new request.
        </div>
      ) : requests.length === 0 ? (
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 28,
            textAlign: "center",
            fontSize: 13,
            color: theme.sub,
          }}
        >
          No requests right now — new ones will show up here.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((req, i) => (
            <Reveal key={req.id} delay={i * 60}>
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 16,
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Package size={19} color={C.primary} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {req.pharmacy}{" "}
                    <span style={{ color: theme.sub, fontWeight: 500 }}>
                      → {req.customer}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.sub, marginTop: 2 }}>
                    {req.items}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      marginTop: 6,
                      fontSize: 11.5,
                      color: theme.sub,
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPin size={12} /> {req.distance}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Clock size={12} /> {req.eta}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  ৳{req.payout}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => declineRequest(req)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      background: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.sub,
                    }}
                    aria-label="Decline"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => acceptRequest(req)}
                    className="qm-btn"
                    style={{
                      background: C.primary,
                      color: "#fff",
                      border: "none",
                      padding: "9px 18px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Earnings ---------- */
function EarningsTab({ theme, earnings, completedToday }) {
  const bars = earnings.bars.map((b, i) =>
    i === earnings.bars.length - 1 ? { ...b, day: "Today" } : b,
  );
  const maxAmount = Math.max(...bars.map((b) => b.amount), 1);
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
        className="qm-dash-stats"
      >
        {[
          { label: "Today", value: earnings.today },
          { label: "This week", value: earnings.week },
          { label: "This month", value: earnings.month },
          { label: "All-time", value: earnings.allTime },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              ৳{s.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: theme.sub }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Reveal>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 18,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
            Last 7 days
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 140,
            }}
          >
            {bars.map((b, i) => (
              <div
                key={`${b.day}-${i}`}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{ fontSize: 10.5, color: theme.sub, fontWeight: 700 }}
                >
                  ৳{b.amount}
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 32,
                    height: Math.max((b.amount / maxAmount) * 96, 4),
                    borderRadius: 6,
                    background: b.day === "Today" ? C.primary : "#BFDBFE",
                  }}
                />
                <div
                  style={{ fontSize: 11, color: theme.sub, fontWeight: 600 }}
                >
                  {b.day}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
        Today's payouts
      </div>
      {completedToday.length === 0 ? (
        <div style={{ fontSize: 13, color: theme.sub }}>
          No deliveries completed yet today.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {completedToday.map((d) => (
            <div
              key={d.id}
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  {d.request_code}{" "}
                  <span style={{ color: theme.sub, fontWeight: 500 }}>
                    · {d.customer}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: theme.sub }}>{d.items}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 12, color: theme.sub }}>
                  {new Date(d.completed_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                  ৳{d.payout}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Delivery history ---------- */
function HistoryTab({ theme, history }) {
  const isToday = (iso) =>
    new Date(iso).toDateString() === new Date().toDateString();
  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
        All deliveries
      </div>
      <div style={{ fontSize: 12.5, color: theme.sub, marginBottom: 18 }}>
        {history.length} deliveries · ৳
        {history.reduce((s, d) => s + Number(d.payout), 0).toLocaleString()}{" "}
        earned
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {history.map((d) => (
          <div
            key={d.id}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={15} color="#047857" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  {d.request_code}{" "}
                  <span style={{ color: theme.sub, fontWeight: 500 }}>
                    · {d.customer}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: theme.sub }}>{d.items}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 12, color: theme.sub }}>
                {isToday(d.completed_at)
                  ? "Today"
                  : new Date(d.completed_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                ৳{d.payout}
              </span>
              <Badge tone="secondary">Delivered</Badge>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Edit profile ---------- */
function ProfileTab({ theme, profile, onSave, onChangePassword }) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    vehicle: profile.vehicle,
    vehicleNumber: profile.vehicleNumber,
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      await onSave({ ...profile, ...form });
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
      await onChangePassword(pw.current, pw.next);
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
          {profile.id} · {profile.since || "Rider partner"} ·{" "}
          {Number(profile.rating).toFixed(1)}{" "}
          <Star
            size={11}
            style={{
              display: "inline",
              verticalAlign: -1,
              fill: "#F59E0B",
              color: "#F59E0B",
            }}
          />{" "}
          rating
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
            label="Email address"
            icon={Mail}
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
          />
          <Field
            theme={theme}
            label="Vehicle"
            icon={Truck}
            value={form.vehicle}
            onChange={set("vehicle")}
            placeholder="e.g. Motorbike · Dhaka Metro"
          />
          <Field
            theme={theme}
            label="Vehicle number"
            icon={Bike}
            value={form.vehicleNumber}
            onChange={set("vehicleNumber")}
            placeholder="Plate / registration number"
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
