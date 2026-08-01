



/* LoginPage.jsx
   User login form with a role toggle so both customers and riders can log in
   from the same page. Both roles now authenticate against PostgreSQL via
   the backend (/api/customers/login and /api/riders/login).
*/
import { useState } from "react";
import { Eye, EyeOff, User, Bike } from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal } from "../components/Common";
import { AuthIllustration } from "../components/AuthIllustration";
import { api } from "../api";

export function LoginPage({ theme, goTo, onRiderLogin, onCustomerLogin }) {
  const [role, setRole] = useState("customer"); // "customer" | "rider"
  const [showPw, setShowPw] = useState(false);

  // Customer-only state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [customerChecking, setCustomerChecking] = useState(false);

  // Rider-only state
  const [riderId, setRiderId] = useState("");
  const [riderPw, setRiderPw] = useState("");
  const [riderError, setRiderError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleRoleChange = (r) => {
    setRole(r);
    setShowPw(false);
    setRiderError("");
    setCustomerError("");
  };

  const handleCustomerSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setCustomerError("Enter both your email and password to continue.");
      return;
    }
    setCustomerError("");
    setCustomerChecking(true);
    try {
      const profile = await api.loginCustomer(email, password);
      onCustomerLogin?.(profile);
      goTo("dashboard");
    } catch (e) {
      setCustomerError(e.message || "Invalid email or password. Please try again.");
    } finally {
      setCustomerChecking(false);
    }
  };

  const handleRiderSubmit = async () => {
    if (!riderId.trim() || !riderPw.trim()) {
      setRiderError("Enter both your rider ID and password to continue.");
      return;
    }
    setRiderError("");
    setChecking(true);
    try {
      const profile = await api.loginRider(riderId, riderPw);
      onRiderLogin?.(profile);
      goTo("riderDashboard");
    } catch (e) {
      setRiderError(e.message || "Invalid rider ID or password. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px 90px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="qm-auth-grid">
      <Reveal><AuthIllustration theme={theme} /></Reveal>
      <Reveal delay={100}>
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 36, maxWidth: 400 }}>
          <h2 className="qm-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 13.5, color: theme.sub, marginBottom: 20 }}>Log in to track orders and reorder in a tap.</p>

          {/* Role toggle */}
          <div style={{ display: "flex", gap: 8, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 4, marginBottom: 22 }}>
            {[{ key: "customer", label: "Customer", icon: User }, { key: "rider", label: "Rider", icon: Bike }].map((r) => (
              <button
                key={r.key}
                onClick={() => handleRoleChange(r.key)}
                className="qm-btn"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: "none",
                  cursor: "pointer",
                  padding: "9px 0",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  background: role === r.key ? C.primary : "transparent",
                  color: role === r.key ? "#fff" : theme.sub,
                }}
              >
                <r.icon size={14} /> {r.label}
              </button>
            ))}
          </div>

          {role === "customer" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  style={inputStyle(theme)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomerSubmit()}
                />
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={inputStyle(theme)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomerSubmit()}
                  />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: theme.sub }} aria-label="toggle password">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, color: theme.sub }}><input type="checkbox" /> Remember me</label>
                  <a href="#" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>Forgot password?</a>
                </div>
                {customerError && <div style={{ fontSize: 12.5, color: C.danger, fontWeight: 600 }}>{customerError}</div>}
                <button
                  onClick={handleCustomerSubmit}
                  disabled={customerChecking}
                  className="qm-btn"
                  style={{
                    background: C.primary,
                    color: "#fff",
                    border: "none",
                    padding: "13px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: customerChecking ? "default" : "pointer",
                    marginTop: 8,
                    opacity: customerChecking ? 0.7 : 1,
                  }}
                >
                  {customerChecking ? "Logging in…" : "Log in"}
                </button>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: theme.sub, marginTop: 20 }}>
                Don't have an account? <button onClick={() => goTo("register")} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, cursor: "pointer" }}>Register</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  value={riderId}
                  onChange={(e) => setRiderId(e.target.value)}
                  placeholder="Rider ID, e.g. RID-2291"
                  style={inputStyle(theme)}
                  onKeyDown={(e) => e.key === "Enter" && handleRiderSubmit()}
                />
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={riderPw}
                    onChange={(e) => setRiderPw(e.target.value)}
                    placeholder="Password"
                    style={inputStyle(theme)}
                    onKeyDown={(e) => e.key === "Enter" && handleRiderSubmit()}
                  />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: theme.sub }} aria-label="toggle password">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {riderError && <div style={{ fontSize: 12.5, color: C.danger, fontWeight: 600 }}>{riderError}</div>}
                <button
                  onClick={handleRiderSubmit}
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
              <div style={{ fontSize: 11.5, color: theme.sub, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 12px", marginTop: 18, lineHeight: 1.6 }}>
                Demo credentials — ID <strong>RID-2291</strong>, password <strong>rider123</strong>.
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: theme.sub, marginTop: 20 }}>
                Not a rider yet? <button onClick={() => goTo("register")} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, cursor: "pointer" }}>Learn how to join</button>
              </div>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}