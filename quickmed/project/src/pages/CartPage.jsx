


/* CartPage.jsx
   Shopping cart page listing items with quantity controls, totals, and
   a per-item checkbox so the customer can choose exactly which items to
   buy right now. Only checked items count toward the order summary and
   get sent to checkout — anything left unchecked simply stays in the
   cart for later.
*/
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Pill, Minus, Plus, Trash2, Clock } from "lucide-react";
import { C } from "../theme";
import { Reveal, PageHeader } from "../components/Common";

export function CartPage({
  theme,
  cart,
  updateQty,
  removeFromCart,
  goTo,
  onProceedToCheckout,
}) {
  const [selected, setSelected] = useState(() => new Set(cart.map((i) => i.id)));
  const knownIds = useRef(new Set(cart.map((i) => i.id)));

  // Keep selection in sync with the cart: newly added items default to
  // selected, items that get removed drop out of the selection too.
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set();
      cart.forEach((i) => {
        if (prev.has(i.id) || !knownIds.current.has(i.id)) next.add(i.id);
      });
      knownIds.current = new Set(cart.map((i) => i.id));
      return next;
    });
  }, [cart]);

  const toggleSelected = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = cart.length > 0 && selected.size === cart.length;
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(cart.map((i) => i.id)));
  };

  const selectedItems = cart.filter((i) => selected.has(i.id));
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = selectedItems.length ? 25 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const handleRemove = (id) => {
    removeFromCart(id);
    setSelected((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };

  const handleQtyChange = (id, qty) => {
    updateQty(id, qty);
    if (qty <= 0) {
      setSelected((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const handleProceed = () => {
    if (selectedItems.length === 0) return;
    onProceedToCheckout?.(selectedItems);
  };

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
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 700,
                color: theme.sub,
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                style={checkboxStyle}
              />
              {allSelected ? "Deselect all" : "Select all"}
              <span style={{ marginLeft: "auto", fontWeight: 600 }}>
                {selected.size} of {cart.length} selected
              </span>
            </label>

            {cart.map((item) => {
              const isSelected = selected.has(item.id);
              return (
                <Reveal key={item.id}>
                  <div
                    style={{
                      background: theme.card,
                      border: `1px solid ${isSelected ? C.primary : theme.border}`,
                      borderRadius: 16,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      opacity: isSelected ? 1 : 0.55,
                      transition: "opacity 0.2s, border-color 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(item.id)}
                      style={checkboxStyle}
                      aria-label={`Select ${item.name}`}
                    />
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
                        onClick={() => handleQtyChange(item.id, item.qty - 1)}
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
                        onClick={() => handleQtyChange(item.id, item.qty + 1)}
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
                      onClick={() => handleRemove(item.id)}
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
              );
            })}
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
              {selectedItems.length === 0 ? (
                <div
                  style={{
                    fontSize: 12.5,
                    color: theme.sub,
                    marginBottom: 18,
                    lineHeight: 1.6,
                  }}
                >
                  Select at least one item to see your total.
                </div>
              ) : (
                [
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
                ))
              )}
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
                onClick={handleProceed}
                disabled={selectedItems.length === 0}
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
                  cursor: selectedItems.length === 0 ? "default" : "pointer",
                  opacity: selectedItems.length === 0 ? 0.6 : 1,
                }}
              >
                Proceed to checkout
                {selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
              </button>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}

const checkboxStyle = {
  width: 18,
  height: 18,
  accentColor: C.primary,
  cursor: "pointer",
  flexShrink: 0,
};