


/* App.jsx
   Root component — handles routing between pages, theme and global state.
*/
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, ShoppingCart, Sun as SunIcon, Moon, Menu, X, ChevronLeft,
  Facebook, Instagram, Twitter, Linkedin, Youtube, ExternalLink, Apple, Play,
} from "lucide-react";
import "./animations.css";
import "./responsive.css";

import { C } from "./theme";
import { FontLink } from "./components/Common";

import { HomePage } from "./pages/HomePage";
import { MedicinesPage } from "./pages/MedicinesPage";
import { DetailPage } from "./pages/DetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TrackingPage } from "./pages/TrackingPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { RiderLoginPage } from "./pages/RiderLoginPage";
import { RiderDashboardPage } from "./pages/RiderDashboardPage";

/* QuickMedApp: root component - handles routing between pages, theme and global state */
export default function QuickMedApp() {
  const [page, setPage] = useState("home");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [wishlist, setWishlist] = useState({});
  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [rider, setRider] = useState(null);
  const pageRef = useRef(page);
  const selectedMedicineRef = useRef(selectedMedicine);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { selectedMedicineRef.current = selectedMedicine; }, [selectedMedicine]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback((p, medicine) => {
    if (p !== pageRef.current) {
      setHistory((h) => [...h, { page: pageRef.current, medicine: selectedMedicineRef.current }]);
    }
    if (medicine) setSelectedMedicine(medicine);
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, []);

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setSelectedMedicine(prev.medicine);
      setPage(prev.page);
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      return h.slice(0, -1);
    });
  }, []);

  const toggleWishlist = useCallback((id) => setWishlist((w) => ({ ...w, [id]: !w[id] })), []);

  const handleRiderLogin = useCallback((r) => setRider(r), []);
  const handleRiderLogout = useCallback(() => {
    setRider(null);
    goTo("home");
  }, [goTo]);

  const addToCart = useCallback((m, qty = 1) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === m.id);
      if (existing) return c.map((i) => (i.id === m.id ? { ...i, qty: i.qty + qty } : i));
      return [...c, { ...m, qty }];
    });
  }, []);
  const updateQty = useCallback((id, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i))));
  }, []);
  const removeFromCart = useCallback((id) => setCart((c) => c.filter((i) => i.id !== id)), []);

  const theme = dark
    ? { bg: "#0B1220", card: "#111A2B", text: "#F1F5F9", sub: "#94A3B8", border: "#1E293B" }
    : { bg: C.bg, card: C.card, text: C.text, sub: "#5B6472", border: "#E5E9F0" };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const NAV_ITEMS = [
    { label: "Home", page: "home" },
    { label: "About", page: "about" }, { label: "Contact", page: "contact" },
  ];
  const isRiderRoute = page === "riderLogin" || page === "riderDashboard";

  let body;
  if (page === "home") body = <HomePage theme={theme} dark={dark} cart={cart} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} goTo={goTo} />;
  else if (page === "medicines") body = <MedicinesPage theme={theme} dark={dark} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} goTo={goTo} />;
  else if (page === "detail") body = <DetailPage medicine={selectedMedicine} theme={theme} dark={dark} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} goTo={goTo} goBack={goBack} />;
  else if (page === "cart") body = <CartPage theme={theme} cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} goTo={goTo} />;
  else if (page === "checkout") body = <CheckoutPage theme={theme} cart={cart} goTo={goTo} addToCart={addToCart} />;
  else if (page === "login") body = <LoginPage theme={theme} goTo={goTo} onRiderLogin={handleRiderLogin} />;
  else if (page === "register") body = <RegisterPage theme={theme} goTo={goTo} />;
  else if (page === "dashboard") body = <DashboardPage theme={theme} cart={cart} wishlist={wishlist} goTo={goTo} addToCart={addToCart} />;
  else if (page === "tracking") body = <TrackingPage theme={theme} />;
  else if (page === "about") body = <AboutPage theme={theme} />;
  else if (page === "contact") body = <ContactPage theme={theme} />;
  else if (page === "riderLogin") body = <RiderLoginPage theme={theme} goTo={goTo} onRiderLogin={handleRiderLogin} />;
  else if (page === "riderDashboard") body = rider
    ? <RiderDashboardPage theme={theme} goTo={goTo} rider={rider} onLogout={handleRiderLogout} />
    : <RiderLoginPage theme={theme} goTo={goTo} onRiderLogin={handleRiderLogin} />;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: theme.bg, color: theme.text, minHeight: "100%", transition: "background 0.4s, color 0.4s" }}>
      <FontLink />
      {/* NAVBAR (hidden on rider pages — riders get a self-contained interface)
          Floating rounded pill bar with a glossy "mirror" glass effect: heavy
          blur + saturation on the background, plus a soft reflective highlight
          gradient laid over the top half. */}
      {!isRiderRoute && (
      <div style={{ position: "sticky", top: 10, zIndex: 50, padding: "0 16px" }}>
        <nav
          style={{
            maxWidth: 1508,
            margin: "0 auto",
            borderRadius: 999,
            position: "relative",
            overflow: "hidden",
            background: dark ? "rgba(17,26,43,0.75)" : "rgba(255,255,255,0.68)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.6)"}`,
            boxShadow: scrolled
              ? "0 14px 34px -14px rgba(17,24,39,0.32), inset 0 1px 0 rgba(255,255,255,0.5)"
              : "0 8px 22px -14px rgba(17,24,39,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
            transition: "all 0.35s",
          }}
        >
          {/* mirror highlight sweep */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: dark
              ? "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 100%)",
          }} />
          <div style={{ position: "relative", padding: "15px 26px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={() => goTo("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus color="#fff" size={19} strokeWidth={2.6} /></div>
              <span className="qm-display" style={{ fontWeight: 800, fontSize: 19 }}>Quick<span style={{ color: C.primary }}>Med</span></span>
            </div>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="qm-nav-desktop">
              {NAV_ITEMS.map((item) => (
                <button key={item.label} onClick={() => goTo(item.page)} className="qm-link" style={{ fontSize: 15, fontWeight: 600, color: page === item.page ? C.primary : theme.text, textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}>{item.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => setDark(!dark)} className="qm-btn" style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub, display: "flex" }} aria-label="Toggle theme">{dark ? <SunIcon size={19} /> : <Moon size={19} />}</button>
              <button onClick={() => goTo("cart")} className="qm-btn" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, position: "relative", display: "flex" }} aria-label="Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: C.danger, color: "#fff", fontSize: 9.5, fontWeight: 700, borderRadius: 999, width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
              </button>
              <button onClick={() => goTo("login")} className="qm-desktop-only" style={{ fontSize: 14.5, fontWeight: 700, color: theme.text, background: "none", border: "none", cursor: "pointer" }}>Login</button>
              <button onClick={() => goTo("register")} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "11px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>Register</button>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "none" }} className="qm-hamburger" aria-label="Menu">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
            </div>
          </div>
          {menuOpen && (
            <div style={{ position: "relative", padding: "15px 26px 22px", display: "flex", flexDirection: "column", gap: 16, borderTop: `1px solid ${theme.border}` }}>
              {[...NAV_ITEMS, { label: "Login", page: "login" }, { label: "Dashboard", page: "dashboard" }, { label: "Ride with us", page: rider ? "riderDashboard" : "riderLogin" }].map((item) => (
                <button key={item.label} onClick={() => goTo(item.page)} style={{ fontSize: 15, fontWeight: 600, color: theme.text, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>{item.label}</button>
              ))}
            </div>
          )}
        </nav>
      </div>
      )}

      {!isRiderRoute && page !== "home" && page !== "detail" && history.length > 0 && (
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 24px 0" }}>
          <button onClick={goBack} className="qm-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: theme.sub, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      )}

      {body}

      {/* FOOTER (hidden on rider pages) */}
      {!isRiderRoute && (
      <footer style={{ borderTop: `1px solid ${theme.border}`, padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>

          {/* Legal disclaimer */}
          <p style={{ fontSize: 12.5, color: theme.sub, lineHeight: 1.7, marginBottom: 44, maxWidth: 1100 }}>
            The testimonials, opinions and statements reflect one individual's personal experience with Quick Med. Results and experiences may vary from person to person and will be unique to each individual. The testimonials are voluntarily provided and are not paid. The individual in the photo is not the individual who provided this testimonial.
          </p>

          {/* Brand + link columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr 1fr", gap: 32 }} className="qm-footer-grid">

            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus color="#fff" size={18} strokeWidth={2.6} /></div>
                <span className="qm-display" style={{ fontWeight: 800, fontSize: 19 }}>Quick<span style={{ color: C.primary }}>Med</span></span>
              </div>
              <div style={{ display: "flex", gap: 10, margin: "18px 0 26px" }}>
                {[Facebook, Instagram, Linkedin, Youtube, Twitter].map((Icon, i) => (
                  <a key={i} href="#" style={{ width: 32, height: 32, borderRadius: "50%", background: theme.card, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: theme.text }}><Icon size={14} /></a>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Headquarters</div>
              <div style={{ fontSize: 13, color: theme.sub, lineHeight: 1.6, marginBottom: 22 }}>
                Quick Med, Inc.<br />
                House 14, Road 11,<br />
                Banani<br />
                Dhaka 1213
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6, maxWidth: 210 }}>
                Empowering every household to reach medicine within minutes.
              </div>
            </div>

            {/* Individuals -> For customers */}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: theme.text }}>Individuals</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {["Order medicines", "Upload prescription", "Track an order", "Medicine reminders", "Health articles", "Loyalty rewards"].map((l) => (
                  <a key={l} href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>{l}</a>
                ))}
              </div>
            </div>

            {/* Organizations -> For pharmacies */}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: theme.text }}>Organizations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {["Partner with us", "Pharmacy onboarding", "Bulk & institutional orders", "Hospitals & clinics", "Resource center"].map((l) => (
                  <a key={l} href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>{l}</a>
                ))}
              </div>
            </div>

            {/* Clinicians -> For riders */}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: theme.text }}>Riders</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <button onClick={() => goTo(rider ? "riderDashboard" : "riderLogin")} style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>Ride with us</button>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>Rider careers <ExternalLink size={12} /></a>
              </div>
            </div>

            {/* Who we are -> Company */}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: theme.text }}>Who we are</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <button onClick={() => goTo("about")} style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>Our company</button>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Our impact</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Leadership</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Careers</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Newsroom</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>Investors <ExternalLink size={12} /></a>
              </div>
            </div>

            {/* Helpful links */}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: theme.text }}>Helpful links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <button onClick={() => goTo("contact")} style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>Contact us</button>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Health library</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Help center</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Legal, privacy & compliance</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Your privacy choices</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Language assistance services</a>
                <a href="#" style={{ fontSize: 13.5, color: C.primary, fontWeight: 600, textDecoration: "none" }}>Community guidelines</a>
              </div>
            </div>
          </div>

          {/* Bottom bar: copyright + app store badges */}
          <div style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }} className="qm-footer-bottom">
            <div style={{ fontSize: 12.5, color: theme.sub }}>© 2026 Quick Med, Inc.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, background: "#000", color: "#fff", padding: "8px 16px", borderRadius: 10, textDecoration: "none" }}>
                <Apple size={22} fill="#fff" />
                <span style={{ lineHeight: 1.2 }}>
                  <span style={{ display: "block", fontSize: 9.5, opacity: 0.85 }}>Download on the</span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>App Store</span>
                </span>
              </a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, background: "#000", color: "#fff", padding: "8px 16px", borderRadius: 10, textDecoration: "none" }}>
                <Play size={18} fill="#fff" />
                <span style={{ lineHeight: 1.2 }}>
                  <span style={{ display: "block", fontSize: 9.5, opacity: 0.85 }}>GET IT ON</span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>Google Play</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}