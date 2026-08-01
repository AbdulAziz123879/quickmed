


// /* AdminApp.jsx
//    Completely standalone admin panel. No imports from App.jsx, no shared
//    state, no goTo. Reached only via /admin — separate from the rest of
//    the site entirely.
// */
// import { useState, useEffect } from "react";
// import {
//   ShieldCheck, LogOut, Bike, Users, Eye, EyeOff, RefreshCw, Star, Mail, Phone, Package,
//   Store, Plus, X, MapPin, Hash, Trash2,
// } from "lucide-react";
// import { C } from "./theme";

// const API_BASE_URL = "http://localhost:5000";

// export default function AdminApp() {
//   const [token, setToken] = useState(null);
//   const [username, setUsername] = useState(null);

//   if (!token) {
//     return <AdminLogin onLogin={(t, u) => { setToken(t); setUsername(u); }} />;
//   }
//   return <AdminDashboard token={token} username={username} onLogout={() => setToken(null)} />;
// }

// /* ---------- Login ---------- */
// function AdminLogin({ onLogin }) {
//   const [user, setUser] = useState("");
//   const [pw, setPw] = useState("");
//   const [showPw, setShowPw] = useState(false);
//   const [error, setError] = useState("");
//   const [checking, setChecking] = useState(false);

//   const submit = async () => {
//     if (!user.trim() || !pw.trim()) {
//       setError("Enter both username and password.");
//       return;
//     }
//     setError("");
//     setChecking(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username: user, password: pw }),
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.error || "Login failed.");
//       onLogin(data.token, data.username);
//     } catch (e) {
//       setError(e.message || "Something went wrong.");
//     } finally {
//       setChecking(false);
//     }
//   };

//   return (
//     <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1220", fontFamily: "'Inter', sans-serif" }}>
//       <div style={{ width: "100%", maxWidth: 380, background: "#111A2B", border: "1px solid #1E293B", borderRadius: 20, padding: 36 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
//           <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <ShieldCheck size={20} color="#fff" />
//           </div>
//           <div>
//             <div style={{ fontSize: 17, fontWeight: 800, color: "#F1F5F9" }}>Quick Med Admin</div>
//             <div style={{ fontSize: 12, color: "#94A3B8" }}>Internal access only</div>
//           </div>
//         </div>

//         <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//           <input
//             value={user}
//             onChange={(e) => setUser(e.target.value)}
//             placeholder="Username"
//             onKeyDown={(e) => e.key === "Enter" && submit()}
//             style={inputStyle}
//           />
//           <div style={{ position: "relative" }}>
//             <input
//               type={showPw ? "text" : "password"}
//               value={pw}
//               onChange={(e) => setPw(e.target.value)}
//               placeholder="Password"
//               onKeyDown={(e) => e.key === "Enter" && submit()}
//               style={inputStyle}
//             />
//             <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
//               {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
//             </button>
//           </div>
//           {error && <div style={{ fontSize: 12.5, color: "#F87171", fontWeight: 600 }}>{error}</div>}
//           <button
//             onClick={submit}
//             disabled={checking}
//             style={{ background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: checking ? "default" : "pointer", opacity: checking ? 0.7 : 1, marginTop: 6 }}
//           >
//             {checking ? "Checking…" : "Log in"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const inputStyle = {
//   width: "100%", boxSizing: "border-box", border: "1px solid #1E293B", borderRadius: 10,
//   padding: "12px 14px", fontSize: 13.5, outline: "none", background: "#0B1220", color: "#F1F5F9",
// };

// /* ---------- Dashboard ---------- */
// function AdminDashboard({ token, username, onLogout }) {
//   const [tab, setTab] = useState("riders");
//   const [riders, setRiders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [stores, setStores] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const headers = { "x-admin-token": token };
//       const [ridersRes, customersRes, ordersRes, storesRes] = await Promise.all([
//         fetch(`${API_BASE_URL}/api/admin/riders`, { headers }),
//         fetch(`${API_BASE_URL}/api/admin/customers`, { headers }),
//         fetch(`${API_BASE_URL}/api/admin/orders`, { headers }),
//         fetch(`${API_BASE_URL}/api/admin/medical-stores`, { headers }),
//       ]);
//       if (!ridersRes.ok || !customersRes.ok || !ordersRes.ok || !storesRes.ok) throw new Error("Failed to load data.");
//       setRiders(await ridersRes.json());
//       setCustomers(await customersRes.json());
//       setOrders(await ordersRes.json());
//       setStores(await storesRes.json());
//     } catch (e) {
//       setError(e.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const logout = async () => {
//     try {
//       await fetch(`${API_BASE_URL}/api/admin/logout`, { method: "POST", headers: { "x-admin-token": token } });
//     } catch {}
//     onLogout();
//   };

//   const addStore = async (form) => {
//     const res = await fetch(`${API_BASE_URL}/api/admin/medical-stores`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", "x-admin-token": token },
//       body: JSON.stringify(form),
//     });
//     const data = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(data?.error || "Failed to add medical store.");
//     setStores((s) => [data, ...s]);
//   };

//   const deleteStore = async (id) => {
//     const res = await fetch(`${API_BASE_URL}/api/admin/medical-stores/${id}`, {
//       method: "DELETE",
//       headers: { "x-admin-token": token },
//     });
//     if (!res.ok) return;
//     setStores((s) => s.filter((store) => store.id !== id));
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "#0B1220", color: "#F1F5F9", fontFamily: "'Inter', sans-serif" }}>
//       {/* Top bar */}
//       <div style={{ borderBottom: "1px solid #1E293B", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <ShieldCheck size={17} color="#fff" />
//           </div>
//           <div style={{ fontSize: 15.5, fontWeight: 800 }}>Quick Med Admin</div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           <span style={{ fontSize: 13, color: "#94A3B8" }}>Signed in as <strong style={{ color: "#F1F5F9" }}>{username}</strong></span>
//           <button onClick={load} style={iconBtn} aria-label="Refresh"><RefreshCw size={16} /></button>
//           <button onClick={logout} style={{ ...iconBtn, color: "#F87171" }} aria-label="Log out"><LogOut size={16} /></button>
//         </div>
//       </div>

//       <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
//         {/* Tabs */}
//         <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
//           {[
//             { key: "riders", label: `Riders (${riders.length})`, icon: Bike },
//             { key: "customers", label: `Customers (${customers.length})`, icon: Users },
//             { key: "orders", label: `Orders (${orders.length})`, icon: Package },
//             { key: "stores", label: `Medical Stores (${stores.length})`, icon: Store },
//           ].map((t) => (
//             <button
//               key={t.key}
//               onClick={() => setTab(t.key)}
//               style={{
//                 display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer",
//                 padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700,
//                 background: tab === t.key ? C.primary : "#111A2B",
//                 color: tab === t.key ? "#fff" : "#94A3B8",
//               }}
//             >
//               <t.icon size={15} /> {t.label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>Loading…</div>
//         ) : error ? (
//           <div style={{ textAlign: "center", padding: "60px 0", color: "#F87171" }}>{error}</div>
//         ) : tab === "riders" ? (
//           <RidersTable riders={riders} />
//         ) : tab === "customers" ? (
//           <CustomersTable customers={customers} />
//         ) : tab === "orders" ? (
//           <OrdersTable orders={orders} />
//         ) : (
//           <MedicalStoresTab stores={stores} onAdd={addStore} onDelete={deleteStore} />
//         )}
//       </div>
//     </div>
//   );
// }

// const iconBtn = {
//   background: "#111A2B", border: "1px solid #1E293B", borderRadius: 9, width: 34, height: 34,
//   display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#F1F5F9",
// };

// /* ---------- Tables ---------- */
// function RidersTable({ riders }) {
//   if (riders.length === 0) return <EmptyState label="No riders found." />;
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       {riders.map((r) => (
//         <div key={r.id} style={cardStyle}>
//           <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//             <Bike size={18} color={C.primary} />
//           </div>
//           <div style={{ flex: 1, minWidth: 220 }}>
//             <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.name} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· {r.id}</span></div>
//             <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{r.vehicle}{r.vehicle_number ? ` · ${r.vehicle_number}` : ""}</div>
//             <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#94A3B8" }}>
//               {r.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {r.phone}</span>}
//               {r.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {r.email}</span>}
//             </div>
//           </div>
//           {r.rating && (
//             <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700 }}>
//               <Star size={13} style={{ fill: "#F59E0B", color: "#F59E0B" }} /> {Number(r.rating).toFixed(1)}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// function CustomersTable({ customers }) {
//   if (customers.length === 0) return <EmptyState label="No customers found." />;
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       {customers.map((c) => (
//         <div key={c.id} style={cardStyle}>
//           <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: 13 }}>
//             {(c.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
//           </div>
//           <div style={{ flex: 1, minWidth: 220 }}>
//             <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.name} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· #{c.id}</span></div>
//             <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#94A3B8" }}>
//               <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {c.email}</span>
//               {c.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {c.phone}</span>}
//             </div>
//           </div>
//           <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function OrdersTable({ orders }) {
//   if (orders.length === 0) return <EmptyState label="No orders found." />;

//   const statusColor = (status) => {
//     const s = (status || "").toLowerCase();
//     if (s === "delivered") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
//     if (s === "cancelled") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };
//     return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" }; // placed / preparing / on the way / default
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       {orders.map((o) => {
//         const sc = statusColor(o.status);
//         return (
//           <div key={o.id} style={cardStyle}>
//             <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//               <Package size={18} color={C.primary} />
//             </div>
//             <div style={{ flex: 1, minWidth: 240 }}>
//               <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.id} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· {o.order_date}</span></div>
//               <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{o.items}</div>
//             </div>
//             <div style={{ fontSize: 14, fontWeight: 800 }}>৳{o.total}</div>
//             <span style={{ background: sc.bg, color: sc.fg, fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>{o.status}</span>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------- Medical Stores (new) ---------- */
// function MedicalStoresTab({ stores, onAdd, onDelete }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div>
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
//         <button
//           onClick={() => setOpen(true)}
//           style={{
//             display: "flex", alignItems: "center", gap: 8, background: C.primary, color: "#fff",
//             border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
//           }}
//         >
//           <Plus size={15} /> Add medical store
//         </button>
//       </div>

//       {stores.length === 0 ? (
//         <EmptyState label="No medical stores added yet." />
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//           {stores.map((s) => (
//             <div key={s.id} style={cardStyle}>
//               <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                 <Store size={18} color={C.primary} />
//               </div>
//               <div style={{ flex: 1, minWidth: 220 }}>
//                 <div style={{ fontSize: 13.5, fontWeight: 700 }}>
//                   {s.name}
//                   {s.license_number && <span style={{ color: "#94A3B8", fontWeight: 500 }}> · Lic# {s.license_number}</span>}
//                 </div>
//                 {s.address && (
//                   <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
//                     <MapPin size={11} /> {s.address}
//                   </div>
//                 )}
//                 <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#94A3B8" }}>
//                   {s.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {s.phone}</span>}
//                   {s.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {s.email}</span>}
//                 </div>
//               </div>
//               <StatusPill status={s.status} />
//               <button
//                 onClick={() => onDelete(s.id)}
//                 style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
//                 aria-label="Remove store"
//               >
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {open && <AddStoreModal onClose={() => setOpen(false)} onAdd={onAdd} />}
//     </div>
//   );
// }

// function StatusPill({ status }) {
//   const s = (status || "Active").toLowerCase();
//   const tones = {
//     active: { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" },
//     pending: { bg: "rgba(245,158,11,0.14)", fg: "#FBBF24" },
//     suspended: { bg: "rgba(239,68,68,0.14)", fg: "#F87171" },
//   };
//   const t = tones[s] || tones.active;
//   return (
//     <span style={{ background: t.bg, color: t.fg, fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 999, whiteSpace: "nowrap" }}>
//       {status || "Active"}
//     </span>
//   );
// }

// function AddStoreModal({ onClose, onAdd }) {
//   const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", licenseNumber: "", status: "Active" });
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);

//   const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

//   const submit = async () => {
//     if (!form.name.trim()) {
//       setError("Store name is required.");
//       return;
//     }
//     setError("");
//     setSaving(true);
//     try {
//       await onAdd(form);
//       onClose();
//     } catch (e) {
//       setError(e.message || "Failed to add medical store.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(2,6,15,0.65)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
//       <div onClick={(e) => e.stopPropagation()} style={{ background: "#111A2B", border: "1px solid #1E293B", borderRadius: 20, padding: 26, width: "100%", maxWidth: 420 }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <Store size={17} color="#fff" />
//             </div>
//             <div style={{ fontSize: 15.5, fontWeight: 800, color: "#F1F5F9" }}>Add medical store</div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} aria-label="Close"><X size={18} /></button>
//         </div>

//         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//           <input value={form.name} onChange={set("name")} placeholder="Store / pharmacy name *" style={inputStyle} />
//           <input value={form.address} onChange={set("address")} placeholder="Address" style={inputStyle} />
//           <div style={{ display: "flex", gap: 12 }}>
//             <input value={form.phone} onChange={set("phone")} placeholder="Phone" style={inputStyle} />
//             <input value={form.email} onChange={set("email")} placeholder="Email" style={inputStyle} />
//           </div>
//           <input value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="License number" style={inputStyle} />
//           <select value={form.status} onChange={set("status")} style={{ ...inputStyle, appearance: "auto" }}>
//             <option value="Active">Active</option>
//             <option value="Pending">Pending</option>
//             <option value="Suspended">Suspended</option>
//           </select>

//           {error && <div style={{ fontSize: 12.5, color: "#F87171", fontWeight: 600 }}>{error}</div>}

//           <button
//             onClick={submit}
//             disabled={saving}
//             style={{ background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
//           >
//             {saving ? "Adding…" : <><Plus size={16} /> Add store</>}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EmptyState({ label }) {
//   return <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8", fontSize: 13.5 }}>{label}</div>;
// }

// const cardStyle = {
//   background: "#111A2B", border: "1px solid #1E293B", borderRadius: 14, padding: "14px 18px",
//   display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
// };



/* AdminApp.jsx
   Completely standalone admin panel. No imports from App.jsx, no shared
   state, no goTo. Reached only via /admin — separate from the rest of
   the site entirely.
*/
import { useState, useEffect } from "react";
import {
  ShieldCheck, LogOut, Bike, Users, Eye, EyeOff, RefreshCw, Star, Mail, Phone, Package,
  Store, Plus, X, MapPin, Hash, Trash2, Truck, Lock, User,
} from "lucide-react";
import { C } from "./theme";

const API_BASE_URL = "http://localhost:5000";

export default function AdminApp() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  if (!token) {
    return <AdminLogin onLogin={(t, u) => { setToken(t); setUsername(u); }} />;
  }
  return <AdminDashboard token={token} username={username} onLogout={() => setToken(null)} />;
}

/* ---------- Login ---------- */
function AdminLogin({ onLogin }) {
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (!user.trim() || !pw.trim()) {
      setError("Enter both username and password.");
      return;
    }
    setError("");
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Login failed.");
      onLogin(data.token, data.username);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1220", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#111A2B", border: "1px solid #1E293B", borderRadius: 20, padding: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#F1F5F9" }}>Quick Med Admin</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Internal access only</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Username"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={inputStyle}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={inputStyle}
            />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div style={{ fontSize: 12.5, color: "#F87171", fontWeight: 600 }}>{error}</div>}
          <button
            onClick={submit}
            disabled={checking}
            style={{ background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: checking ? "default" : "pointer", opacity: checking ? 0.7 : 1, marginTop: 6 }}
          >
            {checking ? "Checking…" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", border: "1px solid #1E293B", borderRadius: 10,
  padding: "12px 14px", fontSize: 13.5, outline: "none", background: "#0B1220", color: "#F1F5F9",
};

/* ---------- Dashboard ---------- */
function AdminDashboard({ token, username, onLogout }) {
  const [tab, setTab] = useState("riders");
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { "x-admin-token": token };
      const [ridersRes, customersRes, ordersRes, storesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/riders`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/customers`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/orders`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/medical-stores`, { headers }),
      ]);
      if (!ridersRes.ok || !customersRes.ok || !ordersRes.ok || !storesRes.ok) throw new Error("Failed to load data.");
      setRiders(await ridersRes.json());
      setCustomers(await customersRes.json());
      setOrders(await ordersRes.json());
      setStores(await storesRes.json());
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, { method: "POST", headers: { "x-admin-token": token } });
    } catch {}
    onLogout();
  };

  const addRider = async (form) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/riders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to add rider.");
    setRiders((r) => [data, ...r]);
  };

  const deleteRider = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/riders/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    if (!res.ok) return;
    setRiders((r) => r.filter((rider) => rider.id !== id));
  };

  const addStore = async (form) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/medical-stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to add medical store.");
    setStores((s) => [data, ...s]);
  };

  const deleteStore = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/medical-stores/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    if (!res.ok) return;
    setStores((s) => s.filter((store) => store.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", color: "#F1F5F9", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1E293B", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={17} color="#fff" />
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 800 }}>Quick Med Admin</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: "#94A3B8" }}>Signed in as <strong style={{ color: "#F1F5F9" }}>{username}</strong></span>
          <button onClick={load} style={iconBtn} aria-label="Refresh"><RefreshCw size={16} /></button>
          <button onClick={logout} style={{ ...iconBtn, color: "#F87171" }} aria-label="Log out"><LogOut size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { key: "riders", label: `Riders (${riders.length})`, icon: Bike },
            { key: "customers", label: `Customers (${customers.length})`, icon: Users },
            { key: "orders", label: `Orders (${orders.length})`, icon: Package },
            { key: "stores", label: `Medical Stores (${stores.length})`, icon: Store },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer",
                padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                background: tab === t.key ? C.primary : "#111A2B",
                color: tab === t.key ? "#fff" : "#94A3B8",
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>Loading…</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#F87171" }}>{error}</div>
        ) : tab === "riders" ? (
          <RidersTab riders={riders} onAdd={addRider} onDelete={deleteRider} />
        ) : tab === "customers" ? (
          <CustomersTable customers={customers} />
        ) : tab === "orders" ? (
          <OrdersTable orders={orders} />
        ) : (
          <MedicalStoresTab stores={stores} onAdd={addStore} onDelete={deleteStore} />
        )}
      </div>
    </div>
  );
}

const iconBtn = {
  background: "#111A2B", border: "1px solid #1E293B", borderRadius: 9, width: 34, height: 34,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#F1F5F9",
};

/* ---------- Tables ---------- */
function RidersTab({ riders, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: C.primary, color: "#fff",
            border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Add rider
        </button>
      </div>

      {riders.length === 0 ? (
        <EmptyState label="No riders found." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {riders.map((r) => (
            <div key={r.id} style={cardStyle}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bike size={18} color={C.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.name} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· {r.id}</span></div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{r.vehicle}{r.vehicle_number ? ` · ${r.vehicle_number}` : ""}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#94A3B8" }}>
                  {r.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {r.phone}</span>}
                  {r.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {r.email}</span>}
                </div>
              </div>
              {r.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700 }}>
                  <Star size={13} style={{ fill: "#F59E0B", color: "#F59E0B" }} /> {Number(r.rating).toFixed(1)}
                </div>
              )}
              <button
                onClick={() => onDelete(r.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                aria-label="Remove rider"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && <AddRiderModal onClose={() => setOpen(false)} onAdd={onAdd} />}
    </div>
  );
}

function AddRiderModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ id: "", name: "", password: "", vehicle: "", vehicleNumber: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !form.password) {
      setError("Name and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onAdd(form);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to add rider.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(2,6,15,0.65)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#111A2B", border: "1px solid #1E293B", borderRadius: 20, padding: 26, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bike size={17} color="#fff" />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#F1F5F9" }}>Add rider</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} aria-label="Close"><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Hash size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            <input value={form.id} onChange={set("id")} placeholder="Rider ID (leave blank to auto-generate)" style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
          <div style={{ position: "relative" }}>
            <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            <input value={form.name} onChange={set("name")} placeholder="Full name *" style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            <input type="password" value={form.password} onChange={set("password")} placeholder="Password *" style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Truck size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
              <input value={form.vehicle} onChange={set("vehicle")} placeholder="Vehicle, e.g. Motorbike · Dhaka" style={{ ...inputStyle, paddingLeft: 38 }} />
            </div>
          </div>
          <input value={form.vehicleNumber} onChange={set("vehicleNumber")} placeholder="Vehicle number" style={inputStyle} />
          <div style={{ display: "flex", gap: 12 }}>
            <input value={form.phone} onChange={set("phone")} placeholder="Phone" style={inputStyle} />
            <input value={form.email} onChange={set("email")} placeholder="Email" style={inputStyle} />
          </div>

          {error && <div style={{ fontSize: 12.5, color: "#F87171", fontWeight: 600 }}>{error}</div>}

          <button
            onClick={submit}
            disabled={saving}
            style={{ background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {saving ? "Adding…" : <><Plus size={16} /> Add rider</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomersTable({ customers }) {
  if (customers.length === 0) return <EmptyState label="No customers found." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {customers.map((c) => (
        <div key={c.id} style={cardStyle}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: 13 }}>
            {(c.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.name} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· #{c.id}</span></div>
            <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#94A3B8" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {c.email}</span>
              {c.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {c.phone}</span>}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</div>
        </div>
      ))}
    </div>
  );
}

function OrdersTable({ orders }) {
  if (orders.length === 0) return <EmptyState label="No orders found." />;

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
    if (s === "cancelled") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };
    return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" }; // placed / preparing / on the way / default
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {orders.map((o) => {
        const sc = statusColor(o.status);
        return (
          <div key={o.id} style={cardStyle}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Package size={18} color={C.primary} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.id} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· {o.order_date}</span></div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{o.items}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>৳{o.total}</div>
            <span style={{ background: sc.bg, color: sc.fg, fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>{o.status}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Medical Stores (new) ---------- */
function MedicalStoresTab({ stores, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: C.primary, color: "#fff",
            border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Add medical store
        </button>
      </div>

      {stores.length === 0 ? (
        <EmptyState label="No medical stores added yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stores.map((s) => (
            <div key={s.id} style={cardStyle}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1A2437", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Store size={18} color={C.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  {s.name}
                  {s.license_number && <span style={{ color: "#94A3B8", fontWeight: 500 }}> · Lic# {s.license_number}</span>}
                </div>
                {s.address && (
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} /> {s.address}
                  </div>
                )}
                <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#94A3B8" }}>
                  {s.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {s.phone}</span>}
                  {s.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {s.email}</span>}
                </div>
              </div>
              <StatusPill status={s.status} />
              <button
                onClick={() => onDelete(s.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                aria-label="Remove store"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && <AddStoreModal onClose={() => setOpen(false)} onAdd={onAdd} />}
    </div>
  );
}

function StatusPill({ status }) {
  const s = (status || "Active").toLowerCase();
  const tones = {
    active: { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" },
    pending: { bg: "rgba(245,158,11,0.14)", fg: "#FBBF24" },
    suspended: { bg: "rgba(239,68,68,0.14)", fg: "#F87171" },
  };
  const t = tones[s] || tones.active;
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {status || "Active"}
    </span>
  );
}

function AddStoreModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", licenseNumber: "", status: "Active" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Store name is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onAdd(form);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to add medical store.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(2,6,15,0.65)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#111A2B", border: "1px solid #1E293B", borderRadius: 20, padding: 26, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Store size={17} color="#fff" />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#F1F5F9" }}>Add medical store</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} aria-label="Close"><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={form.name} onChange={set("name")} placeholder="Store / pharmacy name *" style={inputStyle} />
          <input value={form.address} onChange={set("address")} placeholder="Address" style={inputStyle} />
          <div style={{ display: "flex", gap: 12 }}>
            <input value={form.phone} onChange={set("phone")} placeholder="Phone" style={inputStyle} />
            <input value={form.email} onChange={set("email")} placeholder="Email" style={inputStyle} />
          </div>
          <input value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="License number" style={inputStyle} />
          <select value={form.status} onChange={set("status")} style={{ ...inputStyle, appearance: "auto" }}>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>

          {error && <div style={{ fontSize: 12.5, color: "#F87171", fontWeight: 600 }}>{error}</div>}

          <button
            onClick={submit}
            disabled={saving}
            style={{ background: C.primary, color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {saving ? "Adding…" : <><Plus size={16} /> Add store</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8", fontSize: 13.5 }}>{label}</div>;
}

const cardStyle = {
  background: "#111A2B", border: "1px solid #1E293B", borderRadius: 14, padding: "14px 18px",
  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
};