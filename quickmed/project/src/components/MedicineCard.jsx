/* MedicineCard.jsx
   Product card showing a single medicine with price, rating and add-to-cart.
*/
import { Heart, Pill } from "lucide-react";
import { C } from "../theme";
import { Badge, StarRow } from "./Common";

export function MedicineCard({ m, theme, dark, wishlist, toggleWishlist, addToCart, onOpen }) {
  return (
    <div className="qm-card-hover" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 18, position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(m.id); }} style={{ position: "absolute", top: 14, right: 14, background: theme.bg, border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }} aria-label="wishlist">
        <Heart size={14} style={{ fill: wishlist[m.id] ? C.danger : "none", color: wishlist[m.id] ? C.danger : theme.sub }} />
      </button>
      <div onClick={onOpen} style={{ cursor: "pointer" }}>
        <div style={{ height: 110, borderRadius: 12, background: dark ? "#1A2437" : "#F1F5FE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Pill size={38} color={C.primary} strokeWidth={1.5} />
        </div>
        {m.rx && <div style={{ marginBottom: 8 }}><Badge tone="danger">Rx required</Badge></div>}
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>{m.name}</div>
        <div style={{ fontSize: 12, color: theme.sub, marginBottom: 8 }}>{m.brand}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><StarRow rating={m.rating} /><span style={{ fontSize: 11.5, color: theme.sub }}>{m.rating}</span></div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>৳{m.price}</span>
          <span style={{ fontSize: 12.5, color: theme.sub, textDecoration: "line-through" }}>৳{m.mrp}</span>
        </div>
        <div style={{ fontSize: 11.5, color: m.stock === "In stock" ? "#047857" : "#B45309", fontWeight: 600, marginBottom: 14 }}>{m.stock}</div>
      </div>
      <button onClick={() => addToCart(m)} className="qm-btn" style={{ marginTop: "auto", background: C.primary, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Add to cart</button>
    </div>
  );
}
