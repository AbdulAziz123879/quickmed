/* DetailPage.jsx
   Single medicine detail view with uses, dosage and warnings.
   Related medicines are now fetched from PostgreSQL via the backend API
   instead of filtering a static MEDICINES import.
*/
import { useState, useEffect } from "react";
import { ChevronLeft, Pill, Heart, Minus, Plus } from "lucide-react";
import { C } from "../theme";
import { api } from "../api";
import { Reveal, Badge, StarRow } from "../components/Common";
import { MedicineCard } from "../components/MedicineCard";

export function DetailPage({
  medicine,
  theme,
  dark,
  wishlist,
  toggleWishlist,
  addToCart,
  goTo,
  goBack,
}) {
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!medicine) return;
    let cancelled = false;
    api
      .getMedicines()
      .then((all) => {
        if (cancelled) return;
        setRelated(
          all
            .filter((m) => m.tag === medicine.tag && m.id !== medicine.id)
            .slice(0, 3),
        );
      })
      .catch((e) => console.error("Failed to load related medicines:", e));
    return () => {
      cancelled = true;
    };
  }, [medicine]);

  if (!medicine) return null;

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 90px" }}
    >
      <button
        onClick={() => (goBack ? goBack() : goTo("medicines"))}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: theme.sub,
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        <ChevronLeft size={16} /> Back
      </button>
      <div
        style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 48 }}
        className="qm-detail-grid"
      >
        <Reveal>
          <div
            style={{
              height: 340,
              borderRadius: 20,
              background: dark ? "#1A2437" : "#F1F5FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pill size={90} color={C.primary} strokeWidth={1.3} />
          </div>
        </Reveal>
        <Reveal delay={100}>
          {medicine.rx && (
            <div style={{ marginBottom: 12 }}>
              <Badge tone="danger">Prescription required</Badge>
            </div>
          )}
          <h1
            className="qm-display"
            style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}
          >
            {medicine.name}
          </h1>
          <div style={{ color: theme.sub, fontSize: 14, marginBottom: 12 }}>
            By {medicine.brand}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <StarRow rating={medicine.rating} size={15} />
            <span style={{ fontSize: 13, color: theme.sub }}>
              {medicine.rating} rating
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 800 }}>
              ৳{medicine.price}
            </span>
            <span
              style={{
                fontSize: 15,
                color: theme.sub,
                textDecoration: "line-through",
              }}
            >
              ৳{medicine.mrp}
            </span>
            <Badge tone="secondary">
              {Math.round((1 - medicine.price / medicine.mrp) * 100)}% off
            </Badge>
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: medicine.stock === "In stock" ? "#047857" : "#B45309",
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            {medicine.stock}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
              }}
            >
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: theme.text,
                }}
              >
                <Minus size={14} />
              </button>
              <span
                style={{ padding: "0 14px", fontWeight: 700, fontSize: 14 }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                style={{
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: theme.text,
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => toggleWishlist(medicine.id)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.card,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                size={17}
                style={{
                  fill: wishlist[medicine.id] ? C.danger : "none",
                  color: wishlist[medicine.id] ? C.danger : theme.sub,
                }}
              />
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
            <button
              onClick={() => {
                addToCart(medicine, qty);
              }}
              className="qm-btn"
              style={{
                flex: 1,
                background: theme.card,
                border: `1px solid ${C.primary}`,
                color: C.primary,
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Add to cart
            </button>
            <button
              onClick={() => {
                addToCart(medicine, qty);
                goTo("cart");
              }}
              className="qm-btn"
              style={{
                flex: 1,
                background: C.primary,
                border: "none",
                color: "#fff",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Buy now
            </button>
          </div>

          <div
            style={{
              borderTop: `1px solid ${theme.border}`,
              paddingTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Uses
              </div>
              <div style={{ fontSize: 13, color: theme.sub, lineHeight: 1.6 }}>
                {medicine.uses}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Dosage
              </div>
              <div style={{ fontSize: 13, color: theme.sub, lineHeight: 1.6 }}>
                {medicine.dose}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Warnings
              </div>
              <div style={{ fontSize: 13, color: theme.sub, lineHeight: 1.6 }}>
                {medicine.warnings}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h3
            className="qm-display"
            style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}
          >
            Related medicines
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
            className="qm-related-grid"
          >
            {related.map((m) => (
              <MedicineCard
                key={m.id}
                m={m}
                theme={theme}
                dark={dark}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
                onOpen={() => goTo("detail", m)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
