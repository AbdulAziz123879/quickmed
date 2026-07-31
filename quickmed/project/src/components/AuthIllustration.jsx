/* AuthIllustration.jsx
   Decorative illustration shown alongside login/register forms.
*/
import { ShieldCheck, Pill, Truck } from "lucide-react";
import { C } from "../theme";

export function AuthIllustration({ theme }) {
  return (
    <div style={{ position: "relative", height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 180, height: 180, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}22, ${C.accent}22)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck color="#fff" size={40} /></div>
      </div>
      <div style={{ position: "absolute", top: 20, left: 10, animation: "float 4.5s ease-in-out infinite", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 12px 26px -14px rgba(17,24,39,0.2)" }}><Pill size={14} color={C.primary} /> Trusted pharmacies</div>
      <div style={{ position: "absolute", bottom: 30, right: 0, animation: "floatSlow 5s ease-in-out infinite", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 12px 26px -14px rgba(17,24,39,0.2)" }}><Truck size={14} color="#047857" /> 30-min delivery</div>
    </div>
  );
}
