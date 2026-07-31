



/* RegisterPage.jsx
   User registration form, with a role toggle. Riders are pre-registered
   partner accounts (see riderData.js), so choosing "Rider" here links out
   to rider login/contact instead of a real signup form.
*/
import { useState } from "react";
import { User, Bike } from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal } from "../components/Common";
import { AuthIllustration } from "../components/AuthIllustration";

export function RegisterPage({ theme, goTo }) {
  const [role, setRole] = useState("customer"); // "customer" | "rider"
  const [pw, setPw] = useState("");
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", C.danger, "#F59E0B", C.success][strength];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px 90px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="qm-auth-grid">
      <Reveal><AuthIllustration theme={theme} /></Reveal>
      <Reveal delay={100}>
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 36, maxWidth: 400 }}>
          <h2 className="qm-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: 13.5, color: theme.sub, marginBottom: 20 }}>Get medicines delivered in 30 minutes.</p>

          {/* Role toggle */}
          <div style={{ display: "flex", gap: 8, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 4, marginBottom: 22 }}>
            {[{ key: "customer", label: "Customer", icon: User }, { key: "rider", label: "Rider", icon: Bike }].map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
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
                <input placeholder="Full name" style={inputStyle(theme)} />
                <input placeholder="Email address" style={inputStyle(theme)} />
                <input placeholder="Phone number" style={inputStyle(theme)} />
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Create password" style={inputStyle(theme)} />
                {pw.length > 0 && (
                  <div>
                    <div style={{ height: 4, borderRadius: 999, background: theme.border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${strength * 33.3}%`, background: strengthColor, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: strengthColor, marginTop: 4, fontWeight: 600 }}>{strengthLabel} password</div>
                  </div>
                )}
                <button onClick={() => goTo("dashboard")} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginTop: 8 }}>Create account</button>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: theme.sub, marginTop: 20 }}>
                Already have an account? <button onClick={() => goTo("login")} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, cursor: "pointer" }}>Log in</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13.5, color: theme.sub, lineHeight: 1.7, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
                Rider accounts are set up by the Quick Med partner team once you're onboarded — there's no self-signup here. If you already have a rider ID, log in below.
              </div>
              <button onClick={() => goTo("login")} className="qm-btn" style={{ width: "100%", background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>Go to rider login</button>
              <div style={{ textAlign: "center", fontSize: 13, color: theme.sub, marginTop: 20 }}>
                Want to apply as a rider? <a href="#" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Contact partner support</a>
              </div>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}