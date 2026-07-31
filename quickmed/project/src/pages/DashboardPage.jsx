// /* DashboardPage.jsx
//    Logged-in user's dashboard with orders, cart and wishlist summary.
// */
// import {
//   Home as HomeIcon, Pill, Package, FileText, Heart, Bell, User, Settings, LogOut,
//   ScanLine, Siren, ShoppingCart, Gift,
// } from "lucide-react";
// import { C } from "../theme";
// import { ORDERS } from "../data";
// import { Reveal, Badge } from "../components/Common";
// import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";

// export function DashboardPage({ theme, cart, wishlist, goTo, addToCart }) {
//   const wishlistCount = Object.values(wishlist).filter(Boolean).length;
//   const sideItems = [
//     { icon: HomeIcon, label: "Dashboard" }, { icon: Pill, label: "Medicines", go: "medicines" }, { icon: Package, label: "Orders" },
//     { icon: FileText, label: "Prescriptions" }, { icon: Heart, label: "Wishlist" }, { icon: Bell, label: "Notifications" },
//     { icon: User, label: "Profile" }, { icon: Settings, label: "Settings" }, { icon: LogOut, label: "Logout", go: "home" },
//   ];
//   return (
//     <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px 90px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }} className="qm-dash-grid">
//       <div style={{ display: "flex", flexDirection: "column", gap: 4 }} className="qm-dash-sidebar">
//         {sideItems.map((it) => (
//           <button key={it.label} onClick={() => it.go && goTo(it.go)} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 12, background: it.label === "Dashboard" ? "#EFF6FF" : "none", border: "none", padding: "11px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: it.label === "Dashboard" ? C.primary : theme.text, textAlign: "left" }}>
//             <it.icon size={17} /> {it.label}
//           </button>
//         ))}
//       </div>
//       <div>
//         <Reveal>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
//             <div>
//               <h1 className="qm-display" style={{ fontSize: 24, fontWeight: 800 }}>Welcome back, Ayesha</h1>
//               <p style={{ color: theme.sub, fontSize: 13.5, marginTop: 4 }}>Here's what's happening with your health today.</p>
//             </div>
//             <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>AR</div>
//           </div>
//         </Reveal>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }} className="qm-dash-stats">
//           {[
//             { label: "Orders", value: ORDERS.length, icon: Package, tone: "#EFF6FF", iconColor: C.primary },
//             { label: "Cart items", value: cart.length, icon: ShoppingCart, tone: "#ECFDF5", iconColor: "#047857" },
//             { label: "Wishlist", value: wishlistCount, icon: Heart, tone: "#FEF2F2", iconColor: C.danger },
//             { label: "Reward points", value: 240, icon: Gift, tone: "#ECFEFF", iconColor: "#0E7490" },
//           ].map((s, i) => (
//             <Reveal key={s.label} delay={i * 60}>
//               <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 18 }}>
//                 <div style={{ width: 36, height: 36, borderRadius: 10, background: s.tone, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><s.icon size={17} color={s.iconColor} /></div>
//                 <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
//                 <div style={{ fontSize: 12, color: theme.sub }}>{s.label}</div>
//               </div>
//             </Reveal>
//           ))}
//         </div>
//         <Reveal>
//           <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
//             <PrescriptionUploadButton theme={theme} variant="pill" addToCart={addToCart} />
//             {[{ label: "AI scanner", icon: ScanLine }, { label: "Emergency order", icon: Siren }, { label: "Refill medicine", icon: Package }].map((a) => (
//               <button key={a.label} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: theme.text }}><a.icon size={15} color={C.primary} /> {a.label}</button>
//             ))}
//           </div>
//         </Reveal>
//         <Reveal>
//           <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent orders</div>
//           <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//             {ORDERS.map((o) => (
//               <div key={o.id} onClick={() => goTo("tracking")} style={{ cursor: "pointer", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
//                 <div>
//                   <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.id} <span style={{ color: theme.sub, fontWeight: 500 }}>· {o.date}</span></div>
//                   <div style={{ fontSize: 12, color: theme.sub }}>{o.items}</div>
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//                   <span style={{ fontSize: 13.5, fontWeight: 700 }}>৳{o.total}</span>
//                   <Badge tone="secondary">{o.status}</Badge>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Reveal>
//       </div>
//       </div>
//   );
// }



import { useState, useEffect } from "react";
import {
  Home as HomeIcon, Pill, Package, FileText, Heart, Bell, User, Settings, LogOut,
  ScanLine, Siren, ShoppingCart, Gift,
} from "lucide-react";
import { C } from "../theme";
import { api } from "../api";
import { Reveal, Badge } from "../components/Common";
import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";

export function DashboardPage({ theme, cart, wishlist, goTo, addToCart }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.getOrders().then(setOrders).catch((e) => console.error("Failed to load orders:", e));
  }, []);

  const wishlistCount = Object.values(wishlist).filter(Boolean).length;
  const sideItems = [
    { icon: HomeIcon, label: "Dashboard" }, { icon: Pill, label: "Medicines", go: "medicines" }, { icon: Package, label: "Orders" },
    { icon: FileText, label: "Prescriptions" }, { icon: Heart, label: "Wishlist" }, { icon: Bell, label: "Notifications" },
    { icon: User, label: "Profile" }, { icon: Settings, label: "Settings" }, { icon: LogOut, label: "Logout", go: "home" },
  ];
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px 90px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }} className="qm-dash-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }} className="qm-dash-sidebar">
        {sideItems.map((it) => (
          <button key={it.label} onClick={() => it.go && goTo(it.go)} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 12, background: it.label === "Dashboard" ? "#EFF6FF" : "none", border: "none", padding: "11px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: it.label === "Dashboard" ? C.primary : theme.text, textAlign: "left" }}>
            <it.icon size={17} /> {it.label}
          </button>
        ))}
      </div>
      <div>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 className="qm-display" style={{ fontSize: 24, fontWeight: 800 }}>Welcome back, Ayesha</h1>
              <p style={{ color: theme.sub, fontSize: 13.5, marginTop: 4 }}>Here's what's happening with your health today.</p>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>AR</div>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }} className="qm-dash-stats">
          {[
            { label: "Orders", value: orders.length, icon: Package, tone: "#EFF6FF", iconColor: C.primary },
            { label: "Cart items", value: cart.length, icon: ShoppingCart, tone: "#ECFDF5", iconColor: "#047857" },
            { label: "Wishlist", value: wishlistCount, icon: Heart, tone: "#FEF2F2", iconColor: C.danger },
            { label: "Reward points", value: 240, icon: Gift, tone: "#ECFEFF", iconColor: "#0E7490" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.tone, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><s.icon size={17} color={s.iconColor} /></div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: theme.sub }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
            <PrescriptionUploadButton theme={theme} variant="pill" addToCart={addToCart} />
            {[{ label: "AI scanner", icon: ScanLine }, { label: "Emergency order", icon: Siren }, { label: "Refill medicine", icon: Package }].map((a) => (
              <button key={a.label} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: theme.text }}><a.icon size={15} color={C.primary} /> {a.label}</button>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent orders</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((o) => (
              <div key={o.id} onClick={() => goTo("tracking")} style={{ cursor: "pointer", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.id} <span style={{ color: theme.sub, fontWeight: 500 }}>· {o.order_date}</span></div>
                  <div style={{ fontSize: 12, color: theme.sub }}>{o.items}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>৳{o.total}</span>
                  <Badge tone="secondary">{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      </div>
  );
}
