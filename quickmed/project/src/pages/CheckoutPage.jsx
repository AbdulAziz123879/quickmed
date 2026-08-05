// /* CheckoutPage.jsx
//    Checkout form for delivery details and payment. Placing an order now
//    saves it to PostgreSQL via api.createOrder — which also creates a
//    matching delivery request that riders see on their dashboard. Also
//    sends the logged-in customer's id/name so the order is linked back
//    to them for the admin panel's per-customer order history.
// */
// import { useState } from "react";
// import { MapPin, CreditCard, Upload, Check } from "lucide-react";
// import { C, inputStyle } from "../theme";
// import { Reveal, PageHeader } from "../components/Common";
// import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";
// import { api } from "../api";

// function generateOrderId() {
//   return `QM-${Math.floor(10000 + Math.random() * 90000)}`;
// }

// export function CheckoutPage({ theme, cart, goTo, addToCart, customer }) {
//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [placing, setPlacing] = useState(false);
//   const [placeError, setPlaceError] = useState("");
//   const [placed, setPlaced] = useState(false);

//   const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
//   const total = subtotal + (cart.length ? 25 : 0) + Math.round(subtotal * 0.05);

//   const handlePlaceOrder = async () => {
//     if (cart.length === 0) return;
//     setPlacing(true);
//     setPlaceError("");
//     try {
//       const itemsText = cart.map((i) => `${i.name} x${i.qty}`).join(", ");
//       await api.createOrder({
//         id: generateOrderId(),
//         items: itemsText,
//         total,
//         address: [address, city].filter(Boolean).join(", "),
//         customerId: customer?.id,
//         customerName: customer?.name,
//       });
//       setPlaced(true);
//     } catch (e) {
//       setPlaceError(e.message || "Failed to place order. Please try again.");
//     } finally {
//       setPlacing(false);
//     }
//   };

//   if (placed) {
//     return (
//       <div
//         style={{
//           maxWidth: 500,
//           margin: "0 auto",
//           padding: "100px 24px",
//           textAlign: "center",
//         }}
//       >
//         <Reveal>
//           <div
//             style={{
//               width: 76,
//               height: 76,
//               borderRadius: "50%",
//               background: "#ECFDF5",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 24px",
//             }}
//           >
//             <Check size={34} color="#047857" />
//           </div>
//           <h2
//             className="qm-display"
//             style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}
//           >
//             Order placed
//           </h2>
//           <p style={{ color: theme.sub, fontSize: 14.5, marginBottom: 28 }}>
//             Your medicines are being prepared. Track the delivery live from your
//             dashboard.
//           </p>
//           <button
//             onClick={() => goTo("tracking")}
//             className="qm-btn"
//             style={{
//               background: C.primary,
//               color: "#fff",
//               border: "none",
//               padding: "13px 26px",
//               borderRadius: 12,
//               fontWeight: 700,
//               cursor: "pointer",
//             }}
//           >
//             Track my order
//           </button>
//         </Reveal>
//       </div>
//     );
//   }
//   return (
//     <div
//       style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 90px" }}
//     >
//       <PageHeader theme={theme} eyebrow="Almost there" title="Checkout" />
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1.4fr 1fr",
//           gap: 32,
//           marginTop: 32,
//         }}
//         className="qm-checkout-grid"
//       >
//         <Reveal>
//           <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             <div
//               style={{
//                 background: theme.card,
//                 border: `1px solid ${theme.border}`,
//                 borderRadius: 16,
//                 padding: 22,
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 14,
//                   fontWeight: 700,
//                   marginBottom: 14,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <MapPin size={16} color={C.primary} /> Delivery address
//               </div>
//               <input
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 placeholder="House / road / area"
//                 style={inputStyle(theme)}
//               />
//               <input
//                 value={city}
//                 onChange={(e) => setCity(e.target.value)}
//                 placeholder="City"
//                 style={{ ...inputStyle(theme), marginTop: 10 }}
//               />
//             </div>
//             <div
//               style={{
//                 background: theme.card,
//                 border: `1px solid ${theme.border}`,
//                 borderRadius: 16,
//                 padding: 22,
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 14,
//                   fontWeight: 700,
//                   marginBottom: 14,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <CreditCard size={16} color={C.primary} /> Payment method
//               </div>
//               {[
//                 "Credit / debit card",
//                 "Mobile banking (bKash/Nagad)",
//                 "Cash on delivery",
//               ].map((p, i) => (
//                 <label
//                   key={p}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 10,
//                     padding: "10px 0",
//                     fontSize: 13.5,
//                     cursor: "pointer",
//                   }}
//                 >
//                   <input type="radio" name="pay" defaultChecked={i === 0} /> {p}
//                 </label>
//               ))}
//             </div>
//             <div
//               style={{
//                 background: theme.card,
//                 border: `1px solid ${theme.border}`,
//                 borderRadius: 16,
//                 padding: 22,
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 14,
//                   fontWeight: 700,
//                   marginBottom: 10,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <Upload size={16} color={C.primary} /> Prescription (if
//                 required)
//               </div>
//               <PrescriptionUploadButton
//                 theme={theme}
//                 variant="dropzone"
//                 addToCart={addToCart}
//               />
//             </div>
//           </div>
//         </Reveal>
//         <Reveal delay={100}>
//           <div
//             style={{
//               background: theme.card,
//               border: `1px solid ${theme.border}`,
//               borderRadius: 18,
//               padding: 24,
//               position: "sticky",
//               top: 90,
//             }}
//           >
//             <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
//               Order summary
//             </div>
//             {cart.map((i) => (
//               <div
//                 key={i.id}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   fontSize: 13,
//                   color: theme.sub,
//                   marginBottom: 8,
//                 }}
//               >
//                 <span>
//                   {i.name} x{i.qty}
//                 </span>
//                 <span>৳{i.price * i.qty}</span>
//               </div>
//             ))}
//             <div
//               style={{
//                 borderTop: `1px solid ${theme.border}`,
//                 marginTop: 10,
//                 paddingTop: 14,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 fontWeight: 800,
//                 fontSize: 16,
//               }}
//             >
//               <span>Total</span>
//               <span>৳{total}</span>
//             </div>
//             {placeError && (
//               <div
//                 style={{
//                   fontSize: 12.5,
//                   color: C.danger,
//                   fontWeight: 600,
//                   marginTop: 14,
//                 }}
//               >
//                 {placeError}
//               </div>
//             )}
//             <button
//               onClick={handlePlaceOrder}
//               disabled={placing || cart.length === 0}
//               className="qm-btn"
//               style={{
//                 width: "100%",
//                 marginTop: 20,
//                 background: C.primary,
//                 color: "#fff",
//                 border: "none",
//                 padding: "13px",
//                 borderRadius: 12,
//                 fontWeight: 700,
//                 fontSize: 14.5,
//                 cursor: placing || cart.length === 0 ? "default" : "pointer",
//                 opacity: placing || cart.length === 0 ? 0.7 : 1,
//               }}
//             >
//               {placing ? "Placing order…" : "Place order"}
//             </button>
//           </div>
//         </Reveal>
//       </div>
//     </div>
//   );
// }


/* CheckoutPage.jsx
   Checkout form for delivery details and payment. Placing an order now
   saves it to PostgreSQL via api.createOrder — which also creates a
   matching delivery request that riders see on their dashboard. Also
   sends the logged-in customer's id/name so the order is linked back
   to them for the admin panel's per-customer order history.
*/
import { useState } from "react";
import { MapPin, CreditCard, Upload, Check } from "lucide-react";
import { C, inputStyle } from "../theme";
import { Reveal, PageHeader } from "../components/Common";
import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";
import { api } from "../api";

function generateOrderId() {
  return `QM-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function CheckoutPage({ theme, cart, goTo, addToCart, customer }) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placed, setPlaced] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (cart.length ? 25 : 0) + Math.round(subtotal * 0.05);

  const addressComplete = address.trim().length > 0 && city.trim().length > 0;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!addressComplete) {
      setPlaceError("Please enter your delivery address and city before placing the order.");
      return;
    }
    setPlacing(true);
    setPlaceError("");
    try {
      const itemsText = cart.map((i) => `${i.name} x${i.qty}`).join(", ");
      await api.createOrder({
        id: generateOrderId(),
        items: itemsText,
        total,
        address: [address, city].filter(Boolean).join(", "),
        customerId: customer?.id,
        customerName: customer?.name,
      });
      setPlaced(true);
    } catch (e) {
      setPlaceError(e.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <Reveal>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Check size={34} color="#047857" />
          </div>
          <h2
            className="qm-display"
            style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}
          >
            Order placed
          </h2>
          <p style={{ color: theme.sub, fontSize: 14.5, marginBottom: 28 }}>
            Your medicines are being prepared. Track the delivery live from your
            dashboard.
          </p>
          <button
            onClick={() => goTo("tracking")}
            className="qm-btn"
            style={{
              background: C.primary,
              color: "#fff",
              border: "none",
              padding: "13px 26px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Track my order
          </button>
        </Reveal>
      </div>
    );
  }
  return (
    <div
      style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 90px" }}
    >
      <PageHeader theme={theme} eyebrow="Almost there" title="Checkout" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 32,
          marginTop: 32,
        }}
        className="qm-checkout-grid"
      >
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MapPin size={16} color={C.primary} /> Delivery address
              </div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / road / area *"
                style={inputStyle(theme)}
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City *"
                style={{ ...inputStyle(theme), marginTop: 10 }}
              />
              <div style={{ fontSize: 11.5, color: theme.sub, marginTop: 8 }}>
                Required — we need this to deliver your order.
              </div>
            </div>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CreditCard size={16} color={C.primary} /> Payment method
              </div>
              {[
                "Credit / debit card",
                "Mobile banking (bKash/Nagad)",
                "Cash on delivery",
              ].map((p, i) => (
                <label
                  key={p}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  <input type="radio" name="pay" defaultChecked={i === 0} /> {p}
                </label>
              ))}
            </div>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Upload size={16} color={C.primary} /> Prescription (if
                required)
              </div>
              <PrescriptionUploadButton
                theme={theme}
                variant="dropzone"
                addToCart={addToCart}
              />
            </div>
          </div>
        </Reveal>
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
            {cart.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: theme.sub,
                  marginBottom: 8,
                }}
              >
                <span>
                  {i.name} x{i.qty}
                </span>
                <span>৳{i.price * i.qty}</span>
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
            {placeError && (
              <div
                style={{
                  fontSize: 12.5,
                  color: C.danger,
                  fontWeight: 600,
                  marginTop: 14,
                }}
              >
                {placeError}
              </div>
            )}
            <button
              onClick={handlePlaceOrder}
              disabled={placing || cart.length === 0 || !addressComplete}
              className="qm-btn"
              style={{
                width: "100%",
                marginTop: 20,
                background: C.primary,
                color: "#fff",
                border: "none",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14.5,
                cursor:
                  placing || cart.length === 0 || !addressComplete
                    ? "default"
                    : "pointer",
                opacity: placing || cart.length === 0 || !addressComplete ? 0.7 : 1,
              }}
            >
              {placing
                ? "Placing order…"
                : !addressComplete
                ? "Enter delivery address to continue"
                : "Place order"}
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}