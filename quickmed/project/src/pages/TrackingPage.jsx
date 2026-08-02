/* TrackingPage.jsx
   Live order tracking page with map/status.
*/
import {
  Package,
  Check,
  ShieldCheck,
  Bike,
  Home as HomeIcon,
  MessageCircle,
  Phone,
} from "lucide-react";
import { C } from "../theme";
import { Reveal, PageHeader } from "../components/Common";

export function TrackingPage({ theme }) {
  const stages = [
    { label: "Preparing", icon: Package, done: true },
    { label: "Accepted", icon: Check, done: true },
    { label: "Picked up", icon: ShieldCheck, done: true },
    { label: "On the way", icon: Bike, done: true, active: true },
    { label: "Delivered", icon: HomeIcon, done: false },
  ];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 90px" }}>
      <PageHeader
        theme={theme}
        eyebrow="Order QM-10245"
        title="Your rider is on the way"
        sub="Estimated arrival in 14 minutes"
      />
      <Reveal>
        <div
          style={{
            height: 220,
            borderRadius: 20,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            marginTop: 28,
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(${theme.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "relative",
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: C.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Bike size={22} color="#fff" />
          </div>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "10%",
              right: "10%",
              height: 2,
              background: theme.border,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "10%",
              width: "55%",
              height: 2,
              background: C.primary,
            }}
          />
          {stages.map((s) => (
            <div
              key={s.label}
              style={{
                position: "relative",
                zIndex: 1,
                textAlign: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: s.done ? C.primary : theme.card,
                  border: `2px solid ${s.done ? C.primary : theme.border}`,
                }}
              >
                <s.icon size={17} color={s.done ? "#fff" : theme.sub} />
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: s.active ? C.primary : theme.text,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={140}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button
            className="qm-btn"
            style={{
              flex: 1,
              minWidth: 160,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              padding: "13px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: theme.text,
            }}
          >
            <MessageCircle size={15} /> Chat with pharmacy
          </button>
          <button
            className="qm-btn"
            style={{
              flex: 1,
              minWidth: 160,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              padding: "13px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: theme.text,
            }}
          >
            <Phone size={15} /> Call rider
          </button>
          <button
            className="qm-btn"
            style={{
              flex: 1,
              minWidth: 160,
              background: "#FEF2F2",
              border: "none",
              padding: "13px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              color: C.danger,
            }}
          >
            Cancel order
          </button>
        </div>
      </Reveal>
    </div>
  );
}
