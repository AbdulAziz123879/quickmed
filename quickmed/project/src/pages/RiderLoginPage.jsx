/* RiderLoginPage.jsx
   Login form for delivery riders. Now authenticates against PostgreSQL via
   the backend's /api/riders/login endpoint instead of a local array.
*/
import { useState } from "react";
import { Bike, MapPin, Wallet, User, Eye, EyeOff } from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal, Badge } from "../components/Common";
import { api } from "../api";

export function RiderLoginPage({ theme, goTo, onRiderLogin }) {
  const [riderId, setRiderId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    if (!riderId.trim() || !password.trim()) {
      setError("Enter both your rider ID and password to continue.");
      return;
    }
    setError("");
    setChecking(true);
    try {
      const profile = await api.loginRider(riderId, password);
      onRiderLogin?.(profile);
      goTo("riderDashboard");
    } catch (e) {
      setError(e.message || "Invalid rider ID or password. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "56px 24px 90px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        alignItems: "center",
      }}
      className="qm-auth-grid"
    >
      <Reveal>
        <div
          style={{
            position: "relative",
            height: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.primary}22, ${C.secondary}22)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bike color="#fff" size={40} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 6,
              animation: "float 4.5s ease-in-out infinite",
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 12px 26px -14px rgba(17,24,39,0.2)",
            }}
          >
            <MapPin size={14} color={C.primary} /> Live delivery routes
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 26,
              right: 0,
              animation: "floatSlow 5s ease-in-out infinite",
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 12px 26px -14px rgba(17,24,39,0.2)",
            }}
          >
            <Wallet size={14} color="#047857" /> Instant payouts
          </div>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 36,
            maxWidth: 400,
          }}
        >
          <Badge tone="secondary">Rider partner</Badge>
          <h2
            className="qm-display"
            style={{ fontSize: 24, fontWeight: 800, margin: "14px 0 6px" }}
          >
            Rider login
          </h2>
          <p style={{ fontSize: 13.5, color: theme.sub, marginBottom: 24 }}>
            Sign in with your rider ID to go online and start accepting
            deliveries.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ position: "relative" }}>
              <User
                size={16}
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
                value={riderId}
                onChange={(e) => setRiderId(e.target.value)}
                placeholder="Rider ID, e.g. RID-2291"
                style={{ ...inputStyle(theme), paddingLeft: 38 }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={inputStyle(theme)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
                  color: theme.sub,
                }}
                aria-label="toggle password"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <div style={{ fontSize: 12.5, color: C.danger, fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={checking}
              className="qm-btn"
              style={{
                background: C.primary,
                color: "#fff",
                border: "none",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14.5,
                cursor: checking ? "default" : "pointer",
                marginTop: 8,
                opacity: checking ? 0.7 : 1,
              }}
            >
              {checking ? "Checking…" : "Log in as rider"}
            </button>
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: theme.sub,
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              marginTop: 18,
              lineHeight: 1.6,
            }}
          >
            Demo credentials — ID <strong>RID-2291</strong>, password{" "}
            <strong>rider123</strong>.
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              color: theme.sub,
              marginTop: 20,
            }}
          >
            Not a rider?{" "}
            <button
              onClick={() => goTo("home")}
              style={{
                background: "none",
                border: "none",
                color: C.primary,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to Quick Med
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
