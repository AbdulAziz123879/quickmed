/* ContactPage.jsx
   Contact form and support info page.
*/
import { Phone, Mail, MapPin } from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal, PageHeader } from "../components/Common";

export function ContactPage({ theme }) {
  return (
    <div
      style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 90px" }}
    >
      <PageHeader
        theme={theme}
        eyebrow="Get in touch"
        title="Contact us"
        sub="Questions about an order or a partnership? We're here."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          marginTop: 32,
        }}
        className="qm-contact-grid"
      >
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input placeholder="Your name" style={inputStyle(theme)} />
            <input placeholder="Email address" style={inputStyle(theme)} />
            <textarea
              placeholder="Your message"
              rows={5}
              style={{ ...inputStyle(theme), resize: "vertical" }}
            />
            <button
              className="qm-btn"
              style={{
                background: C.primary,
                color: "#fff",
                border: "none",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Send message
            </button>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: Phone, t: "Call us", d: "+880 1700-000000" },
              { icon: Mail, t: "Email us", d: "support@quickmed.com" },
              { icon: MapPin, t: "Visit us", d: "Gulshan Avenue, Dhaka 1212" },
            ].map((c) => (
              <div
                key={c.t}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <c.icon size={17} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.t}</div>
                  <div style={{ fontSize: 12.5, color: theme.sub }}>{c.d}</div>
                </div>
              </div>
            ))}
            <div
              style={{
                height: 160,
                borderRadius: 14,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.sub,
                fontSize: 12.5,
              }}
            >
              Map placeholder
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
