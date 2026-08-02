/* CartPage.jsx
   Shopping cart page listing items with quantity controls and totals.
*/
import { ShoppingCart, Pill, Minus, Plus, Trash2, Clock } from "lucide-react";
import { C } from "../theme";
import { Reveal, PageHeader } from "../components/Common";

export function CartPage({ theme, cart, updateQty, removeFromCart, goTo }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = cart.length ? 25 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  return (
    <div
      style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 90px" }}
    >
      <PageHeader theme={theme} eyebrow="Your order" title="Shopping cart" />
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <ShoppingCart
            size={36}
            color={theme.sub}
            style={{ marginBottom: 14, opacity: 0.6 }}
          />
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Your cart is empty
          </div>
          <div style={{ fontSize: 13.5, color: theme.sub, marginBottom: 20 }}>
            Add medicines to see them here.
          </div>
          <button
            onClick={() => goTo("medicines")}
            className="qm-btn"
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Browse medicines
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 32,
            marginTop: 32,
          }}
          className="qm-cart-grid"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cart.map((item) => (
              <Reveal key={item.id}>
                <div
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: "#F1F5FE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Pill size={24} color={C.primary} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: theme.sub }}>
                      {item.brand}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                    }}
                  >
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      style={{
                        padding: "6px 10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.text,
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span
                      style={{
                        padding: "0 10px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      style={{
                        padding: "6px 10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.text,
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14.5,
                      width: 60,
                      textAlign: "right",
                    }}
                  >
                    ৳{item.price * item.qty}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: theme.sub,
                    }}
                    aria-label="remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 18,
                padding: 24,
                position: "sticky",
                top: 90,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
                Order summary
              </div>
              {[
                ["Subtotal", subtotal],
                ["Delivery fee", delivery],
                ["Tax", tax],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13.5,
                    color: theme.sub,
                    marginBottom: 10,
                  }}
                >
                  <span>{l}</span>
                  <span>৳{v}</span>
                </div>
              ))}
              <div
                style={{
                  borderTop: `1px solid ${theme.border}`,
                  marginTop: 10,
                  paddingTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                <span>Total</span>
                <span>৳{total}</span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: theme.sub,
                  margin: "12px 0 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Clock size={13} /> Estimated delivery: 30–60 min
              </div>
              <button
                onClick={() => goTo("checkout")}
                className="qm-btn"
                style={{
                  width: "100%",
                  background: C.primary,
                  color: "#fff",
                  border: "none",
                  padding: "13px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                Proceed to checkout
              </button>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}
