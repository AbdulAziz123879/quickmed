/* Common.jsx
   Small reusable bits shared across pages: font loader, scroll-reveal
   animation helpers, star rating row, badge pill, and page header.
*/
import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { C } from "../theme";

/* FontLink: injects the Google Fonts <link> tag used across the app */
export const FontLink = () => (
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
  />
);

/* ---------- scroll reveal ---------- */
/* useReveal: custom hook that flips 'visible' true once the element scrolls into view */
export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* Reveal: wraps children in a fade/slide-up animation triggered by useReveal */
export function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* Counter: animates a number counting up to a target value when it scrolls into view */
export function Counter({ to, suffix = "", duration = 1400 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ---------- small reusable bits ---------- */
/* StarRow: renders a row of star icons for a given rating */
export function StarRow({ rating, size = 13 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} style={{ fill: i <= Math.round(rating) ? "#F59E0B" : "none", color: i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB" }} />
      ))}
    </div>
  );
}

/* Badge: small pill-shaped label used for tags like 'Rx' or category names */
export function Badge({ children, tone = "primary" }) {
  const map = {
    primary: { bg: "#EFF6FF", color: C.primary }, secondary: { bg: "#ECFDF5", color: "#047857" },
    danger: { bg: "#FEF2F2", color: "#B91C1C" }, accent: { bg: "#ECFEFF", color: "#0E7490" },
  };
  const s = map[tone];
  return <span style={{ background: s.bg, color: s.color, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: 0.2 }}>{children}</span>;
}

/* PageHeader: reusable eyebrow + title + subtitle header used at the top of pages */
export function PageHeader({ theme, eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: title ? "56px 24px 8px" : "0px 24px 0px", maxWidth: 700, margin: "0 auto" }}>
      <Reveal>
        <Badge>{eyebrow}</Badge>
        {title && <h1 className="qm-display" style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 800, margin: "16px 0 10px", letterSpacing: -0.5 }}>{title}</h1>}
        {sub && <p style={{ color: theme.sub, fontSize: 15 }}>{sub}</p>}
      </Reveal>
    </div>
  );
}
