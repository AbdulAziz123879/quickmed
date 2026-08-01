// /* HomePage.jsx
//    The landing page with hero, features, steps, medicines preview, etc.
// */
// import { useState, useEffect, useRef } from "react";
// import { Search, ArrowRight, Truck, Pill, ShieldCheck, MapPin, Syringe, ChevronDown } from "lucide-react";
// import { C } from "../theme";
// import { FEATURES, STEPS, WHY, TESTIMONIALS, FAQS } from "../data";
// import { Reveal, Badge } from "../components/Common";
// import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";
// import { MedicinesPage } from "./MedicinesPage";
// import { ChatBot } from "../components/ChatBot";
// import heroBg from "../images/hero_sec.jpg"; 

// export function HomePage({ theme, dark, cart, addToCart, wishlist, toggleWishlist, goTo }) {
//   const [openFaq, setOpenFaq] = useState(0);
//   const [testiIdx, setTestiIdx] = useState(0);
//   const [email, setEmail] = useState("");
//   const [subscribed, setSubscribed] = useState(false);
//   const [query, setQuery] = useState("");
//   const medicinesRef = useRef(null);
//   const scrollToMedicines = () => medicinesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

//   useEffect(() => {
//     const t = setInterval(() => setTestiIdx((i) => (i + 1) % TESTIMONIALS.length), 5500);
//     return () => clearInterval(t);
//   }, []);

//   return (
//     <>
     


// {/* HERO */}
//       <section style={{ position: "relative", overflow: "hidden", padding: "60px 24px 8px" }}>
      
//         <div style={{
//           position: "absolute", inset: 0, zIndex: 0,
//           backgroundImage: `url(${heroBg})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           opacity: dark ? 0.5 : 0.4,
//         }} />

        
//         {/* Soft wash so text/cards stay readable, stronger on the left where the headline sits */}
//         <div style={{
//           position: "absolute", inset: 0, zIndex: 0,
//           background: dark
//             ? "linear-gradient(100deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.75) 35%, rgba(11,18,32,0.35) 65%, rgba(11,18,32,0.55) 100%)"
//             : "linear-gradient(100deg, rgba(248,250,252,0.95) 0%, rgba(248,250,252,0.85) 35%, rgba(248,250,252,0.45) 65%, rgba(248,250,252,0.7) 100%)",
//         }} />
//         <div style={{ position: "absolute", inset: 0, zIndex: 0, background: dark ? `radial-gradient(700px circle at 15% 10%, rgba(37,99,235,0.25), transparent), radial-gradient(600px circle at 90% 30%, rgba(6,182,212,0.18), transparent)` : `radial-gradient(700px circle at 15% 10%, rgba(37,99,235,0.10), transparent), radial-gradient(600px circle at 90% 20%, rgba(16,185,129,0.10), transparent)` }} />
//         <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }} className="qm-hero-grid">
//           <Reveal>
//             <Badge tone="secondary">Delivered in 30–60 minutes</Badge>
//             <h1 className="qm-display" style={{ fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.08, fontWeight: 800, margin: "20px 0 20px", letterSpacing: -1 }}>
//               Your medicines,<br />delivered within <span style={{ color: C.primary }}>30 minutes</span>
//             </h1>
//             <p style={{ fontSize: 17, color: theme.sub, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
//               Search, upload a prescription, or scan a box — Quick Med connects you to licensed pharmacies nearby and gets medicine to your door, tracked the whole way.
//             </p>
//             <div style={{ display: "flex", alignItems: "center", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "6px 6px 6px 18px", boxShadow: "0 12px 32px -18px rgba(17,24,39,0.18)", maxWidth: 598, marginBottom: 28 }}>
//               <Search size={18} color={theme.sub} />
//               <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicines, e.g. Paracetamol" style={{ border: "none", outline: "none", background: "transparent", flex: 1, padding: "12px 12px", fontSize: 14.5, color: theme.text }} />
//               <button onClick={scrollToMedicines} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Search</button>
//             </div>
//             <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
//               <button onClick={() => goTo("medicines")} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 24px -8px rgba(37,99,235,0.5)" }}>
//                 Order Now <ArrowRight size={17} />
//               </button>
//               <PrescriptionUploadButton theme={theme} addToCart={addToCart} />
//             </div>
//           </Reveal>
//           <Reveal delay={150}>
//             <div style={{ position: "relative", height: 440 }}>
//               <div style={{ position: "absolute", top: "50%", left: "50%", width: 230, height: 230, transform: "translate(-50%,-50%)" }}>
//                 {[0, 1, 2].map((i) => (
//                   <span key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${C.primary}`, animation: `pulseRing 2.6s ease-out infinite`, animationDelay: `${i * 0.85}s` }} />
//                 ))}
//                 <div style={{ position: "absolute", top: "50%", left: "50%", width: 96, height: 96, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px -12px rgba(37,99,235,0.55)" }}>
//                   <Truck color="#fff" size={38} />
//                 </div>
//               </div>
//               <div style={{ position: "absolute", top: 6, left: 0, animation: "float 4.5s ease-in-out infinite", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
//                 <div style={{ width: 34, height: 34, borderRadius: 9, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}><Pill size={16} color="#047857" /></div>
//                 <div><div style={{ fontSize: 13, fontWeight: 700 }}>Medicine matched</div><div style={{ fontSize: 11, color: theme.sub }}>Paracetamol 650mg</div></div>
//               </div>
//               <div style={{ position: "absolute", top: 60, right: 4, animation: "floatSlow 5.5s ease-in-out infinite", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
//                 <div style={{ width: 34, height: 34, borderRadius: 9, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={16} color={C.primary} /></div>
//                 <div><div style={{ fontSize: 13, fontWeight: 700 }}>Trusted pharmacy</div><div style={{ fontSize: 11, color: theme.sub }}>Verified partner</div></div>
//               </div>
//               <div style={{ position: "absolute", bottom: 68, left: 12, animation: "float 5s ease-in-out infinite", animationDelay: "0.6s", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
//                 <div style={{ width: 34, height: 34, borderRadius: 9, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={16} color="#0E7490" /></div>
//                 <div><div style={{ fontSize: 13, fontWeight: 700 }}>Live tracking</div><div style={{ fontSize: 11, color: theme.sub }}>Arriving in 18 min</div></div>
//               </div>
//               <div style={{ position: "absolute", bottom: 0, right: 18, animation: "floatSlow 4.8s ease-in-out infinite", animationDelay: "1s", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
//                 <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}><Syringe size={16} color="#B91C1C" /></div>
//                 <div><div style={{ fontSize: 13, fontWeight: 700 }}>Prescription verified</div><div style={{ fontSize: 11, color: theme.sub }}>By licensed pharmacist</div></div>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//         </section>


//       {/* MEDICINES (inline browse, right after hero search) */}
//       <div ref={medicinesRef}>
//         <MedicinesPage theme={theme} dark={dark} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} goTo={goTo} externalQuery={query} hideSearchBox hideTitle />
//       </div>

//       {/* FEATURES */}
//       <section style={{ padding: "88px 24px 40px" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto" }}>
//           <Reveal><div style={{ textAlign: "center", marginBottom: 52 }}>
//             <Badge>Everything in one app</Badge>
//             <h2 className="qm-display" style={{ fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 800, marginTop: 16, letterSpacing: -0.5 }}>Built for how medicine actually gets used</h2>
//             <p style={{ color: theme.sub, marginTop: 10, fontSize: 15.5 }}>From the first symptom to the delivered dose.</p>
//           </div></Reveal>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="qm-feature-grid">
//             {FEATURES.map((f, i) => (
//               <Reveal key={f.title} delay={i * 60}>
//                 <div className="qm-card-hover" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 24, height: "100%" }}>
//                   <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><f.icon size={21} color={C.primary} /></div>
//                   <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
//                   <div style={{ fontSize: 13.5, color: theme.sub, lineHeight: 1.6 }}>{f.desc}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//         </section>

//       {/* HOW IT WORKS */}
//       <section style={{ padding: "72px 24px" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto" }}>
//           <Reveal><div style={{ textAlign: "center", marginBottom: 56 }}>
//             <Badge tone="accent">The process</Badge>
//             <h2 className="qm-display" style={{ fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 800, marginTop: 16, letterSpacing: -0.5 }}>How it works</h2>
//           </div></Reveal>
//           <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="qm-steps-grid">
//             <div style={{ position: "absolute", top: 34, left: "12.5%", right: "12.5%", height: 2, background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, opacity: 0.25 }} className="qm-steps-line" />
//             {STEPS.map((s, i) => (
//               <Reveal key={s.n} delay={i * 120}>
//                 <div style={{ position: "relative", textAlign: "center" }}>
//                   <div style={{ width: 68, height: 68, borderRadius: "50%", background: theme.card, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", position: "relative", zIndex: 1 }}><s.icon size={26} color={C.primary} /></div>
//                   <div className="qm-display" style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: 1 }}>{s.n}</div>
//                   <div style={{ fontSize: 16, fontWeight: 700, margin: "6px 0 8px" }}>{s.title}</div>
//                   <div style={{ fontSize: 13.5, color: theme.sub, lineHeight: 1.6, maxWidth: 210, margin: "0 auto" }}>{s.desc}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//         </section>

//       {/* WHY CHOOSE US */}
//       <section style={{ padding: "72px 24px" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "center" }} className="qm-why-grid">
//           <Reveal>
//             <Badge tone="secondary">Why Quick Med</Badge>
//             <h2 className="qm-display" style={{ fontSize: "clamp(28px,3.4vw,38px)", fontWeight: 800, margin: "16px 0 16px", lineHeight: 1.2 }}>Healthcare delivery, done with actual care</h2>
//             <p style={{ color: theme.sub, fontSize: 15, lineHeight: 1.7 }}>We built Quick Med around the moments that matter most — a fever at midnight, a refill you forgot, a parent who needs their medicine now. Every partner pharmacy is licensed, every rider is tracked, every order is verified.</p>
//           </Reveal>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
//             {WHY.map((w, i) => (
//               <Reveal key={w.title} delay={i * 70}>
//                 <div className="qm-card-hover" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
//                   <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><w.icon size={18} color="#047857" /></div>
//                   <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{w.title}</div>
//                   <div style={{ fontSize: 12.5, color: theme.sub, lineHeight: 1.5 }}>{w.desc}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//         </section>

//       {/* FAQ */}
//       <section style={{ padding: "72px 24px" }}>
//         <div style={{ maxWidth: 760, margin: "0 auto" }}>
//           <Reveal><div style={{ textAlign: "center", marginBottom: 40 }}><Badge>Questions</Badge><h2 className="qm-display" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, marginTop: 14 }}>Frequently asked questions</h2></div></Reveal>
//           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//             {FAQS.map((f, i) => (
//               <Reveal key={f.q} delay={i * 60}>
//                 <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
//                   <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: "100%", background: "none", border: "none", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 14.5, fontWeight: 700, color: theme.text, textAlign: "left" }}>
//                     {f.q}<ChevronDown size={18} style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: theme.sub, flexShrink: 0, marginLeft: 12 }} />
//                   </button>
//                   <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
//                     <div style={{ padding: "0 20px 18px", fontSize: 13.5, color: theme.sub, lineHeight: 1.7 }}>{f.a}</div>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* NEWSLETTER */}
//       <section style={{ padding: "16px 24px 72px" }}>
//         <Reveal>
//           <div style={{ maxWidth: 1240, margin: "0 auto", background: `linear-gradient(120deg, ${C.primary}, #0891B2)`, borderRadius: 24, padding: "52px 32px", textAlign: "center" }}>
//             <h2 className="qm-display" style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>Get health tips and offers in your inbox</h2>
//             <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14.5, marginBottom: 28 }}>One email a week. Unsubscribe anytime.</p>
//             <div style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
//               <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ flex: 1, minWidth: 220, border: "none", outline: "none", padding: "13px 16px", borderRadius: 10, fontSize: 14 }} />
//               <button onClick={() => setSubscribed(true)} className="qm-btn" style={{ background: "#111827", color: "#fff", border: "none", padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{subscribed ? "Subscribed" : "Subscribe"}</button>
//             </div>
//           </div>
//         </Reveal>
//       </section>
//       <ChatBot theme={theme} dark={dark} />
//     </>
//   );
// }



/* HomePage.jsx
   The landing page with hero, features, steps, medicines preview, etc.
*/
import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Truck, Pill, ShieldCheck, MapPin, Syringe, ChevronDown } from "lucide-react";
import { C } from "../theme";
import { FEATURES, STEPS, WHY, TESTIMONIALS, FAQS, CATEGORIES } from "../data";
import { Reveal, Badge } from "../components/Common";
import { PrescriptionUploadButton } from "../components/PrescriptionUploadButton";
import { MedicinesPage } from "./MedicinesPage";
import { ChatBot } from "../components/ChatBot";
import heroBg from "../images/hero_sec.jpg"; 

export function HomePage({ theme, dark, cart, addToCart, wishlist, toggleWishlist, goTo }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [testiIdx, setTestiIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const medicinesRef = useRef(null);
  const scrollToMedicines = () => medicinesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    const t = setInterval(() => setTestiIdx((i) => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
{/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", padding: "60px 24px 8px" }}>
      
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: dark ? 0.5 : 0.4,
        }} />

        
        {/* Soft wash so text/cards stay readable, stronger on the left where the headline sits */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: dark
            ? "linear-gradient(100deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.75) 35%, rgba(11,18,32,0.35) 65%, rgba(11,18,32,0.55) 100%)"
            : "linear-gradient(100deg, rgba(248,250,252,0.95) 0%, rgba(248,250,252,0.85) 35%, rgba(248,250,252,0.45) 65%, rgba(248,250,252,0.7) 100%)",
        }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: dark ? `radial-gradient(700px circle at 15% 10%, rgba(37,99,235,0.25), transparent), radial-gradient(600px circle at 90% 30%, rgba(6,182,212,0.18), transparent)` : `radial-gradient(700px circle at 15% 10%, rgba(37,99,235,0.10), transparent), radial-gradient(600px circle at 90% 20%, rgba(16,185,129,0.10), transparent)` }} />
        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }} className="qm-hero-grid">
          <Reveal>
            <Badge tone="secondary">Delivered in 30–60 minutes</Badge>
            <h1 className="qm-display" style={{ fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.08, fontWeight: 800, margin: "20px 0 20px", letterSpacing: -1 }}>
              Your medicines,<br />delivered within <span style={{ color: C.primary }}>30 minutes</span>
            </h1>
            <p style={{ fontSize: 17, color: theme.sub, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Search, upload a prescription, or scan a box — Quick Med connects you to licensed pharmacies nearby and gets medicine to your door, tracked the whole way.
            </p>

            {/* Category pills — moved above the search bar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "4px 0 22px" }}>
              {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className="qm-btn"
                  style={{
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    border: `1px solid ${activeCat === c ? C.primary : theme.border}`,
                    background: activeCat === c ? C.primary : theme.card,
                    color: activeCat === c ? "#fff" : theme.text,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Search bar — enlarged and centered */}
            <div style={{ display: "flex", alignItems: "center", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: "8px 8px 8px 22px", boxShadow: "0 16px 40px -18px rgba(17,24,39,0.22)", maxWidth: 640, margin: "0 auto 28px" }}>
              <Search size={20} color={theme.sub} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicines, e.g. Paracetamol" style={{ border: "none", outline: "none", background: "transparent", flex: 1, padding: "16px 14px", fontSize: 16, color: theme.text }} />
              <button onClick={scrollToMedicines} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "15px 26px", borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Search</button>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={() => goTo("medicines")} className="qm-btn" style={{ background: C.primary, color: "#fff", border: "none", padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 24px -8px rgba(37,99,235,0.5)" }}>
                Order Now <ArrowRight size={17} />
              </button>
              <PrescriptionUploadButton theme={theme} addToCart={addToCart} />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div style={{ position: "relative", height: 440 }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 230, height: 230, transform: "translate(-50%,-50%)" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${C.primary}`, animation: `pulseRing 2.6s ease-out infinite`, animationDelay: `${i * 0.85}s` }} />
                ))}
                <div style={{ position: "absolute", top: "50%", left: "50%", width: 96, height: 96, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px -12px rgba(37,99,235,0.55)" }}>
                  <Truck color="#fff" size={38} />
                </div>
              </div>
              <div style={{ position: "absolute", top: 6, left: 0, animation: "float 4.5s ease-in-out infinite", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}><Pill size={16} color="#047857" /></div>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>Medicine matched</div><div style={{ fontSize: 11, color: theme.sub }}>Paracetamol 650mg</div></div>
              </div>
              <div style={{ position: "absolute", top: 60, right: 4, animation: "floatSlow 5.5s ease-in-out infinite", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={16} color={C.primary} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>Trusted pharmacy</div><div style={{ fontSize: 11, color: theme.sub }}>Verified partner</div></div>
              </div>
              <div style={{ position: "absolute", bottom: 68, left: 12, animation: "float 5s ease-in-out infinite", animationDelay: "0.6s", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={16} color="#0E7490" /></div>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>Live tracking</div><div style={{ fontSize: 11, color: theme.sub }}>Arriving in 18 min</div></div>
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 18, animation: "floatSlow 4.8s ease-in-out infinite", animationDelay: "1s", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 14px 32px -16px rgba(17,24,39,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}><Syringe size={16} color="#B91C1C" /></div>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>Prescription verified</div><div style={{ fontSize: 11, color: theme.sub }}>By licensed pharmacist</div></div>
              </div>
            </div>
          </Reveal>
        </div>
        </section>


      {/* MEDICINES (inline browse, right after hero search) */}
      <div ref={medicinesRef}>
        <MedicinesPage theme={theme} dark={dark} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} goTo={goTo} externalQuery={query} externalCat={activeCat} hideSearchBox hideTitle hideCategories />
      </div>

      {/* FEATURES */}
      <section style={{ padding: "88px 24px 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Reveal><div style={{ textAlign: "center", marginBottom: 52 }}>
            <Badge>Everything in one app</Badge>
            <h2 className="qm-display" style={{ fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 800, marginTop: 16, letterSpacing: -0.5 }}>Built for how medicine actually gets used</h2>
            <p style={{ color: theme.sub, marginTop: 10, fontSize: 15.5 }}>From the first symptom to the delivered dose.</p>
          </div></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="qm-feature-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="qm-card-hover" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 24, height: "100%" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><f.icon size={21} color={C.primary} /></div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13.5, color: theme.sub, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Reveal><div style={{ textAlign: "center", marginBottom: 56 }}>
            <Badge tone="accent">The process</Badge>
            <h2 className="qm-display" style={{ fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 800, marginTop: 16, letterSpacing: -0.5 }}>How it works</h2>
          </div></Reveal>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="qm-steps-grid">
            <div style={{ position: "absolute", top: 34, left: "12.5%", right: "12.5%", height: 2, background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, opacity: 0.25 }} className="qm-steps-line" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div style={{ position: "relative", textAlign: "center" }}>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: theme.card, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", position: "relative", zIndex: 1 }}><s.icon size={26} color={C.primary} /></div>
                  <div className="qm-display" style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, margin: "6px 0 8px" }}>{s.title}</div>
                  <div style={{ fontSize: 13.5, color: theme.sub, lineHeight: 1.6, maxWidth: 210, margin: "0 auto" }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "center" }} className="qm-why-grid">
          <Reveal>
            <Badge tone="secondary">Why Quick Med</Badge>
            <h2 className="qm-display" style={{ fontSize: "clamp(28px,3.4vw,38px)", fontWeight: 800, margin: "16px 0 16px", lineHeight: 1.2 }}>Healthcare delivery, done with actual care</h2>
            <p style={{ color: theme.sub, fontSize: 15, lineHeight: 1.7 }}>We built Quick Med around the moments that matter most — a fever at midnight, a refill you forgot, a parent who needs their medicine now. Every partner pharmacy is licensed, every rider is tracked, every order is verified.</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 70}>
                <div className="qm-card-hover" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><w.icon size={18} color="#047857" /></div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{w.title}</div>
                  <div style={{ fontSize: 12.5, color: theme.sub, lineHeight: 1.5 }}>{w.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        </section>

      {/* FAQ */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal><div style={{ textAlign: "center", marginBottom: 40 }}><Badge>Questions</Badge><h2 className="qm-display" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, marginTop: 14 }}>Frequently asked questions</h2></div></Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: "100%", background: "none", border: "none", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 14.5, fontWeight: 700, color: theme.text, textAlign: "left" }}>
                    {f.q}<ChevronDown size={18} style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: theme.sub, flexShrink: 0, marginLeft: 12 }} />
                  </button>
                  <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                    <div style={{ padding: "0 20px 18px", fontSize: 13.5, color: theme.sub, lineHeight: 1.7 }}>{f.a}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ padding: "16px 24px 72px" }}>
        <Reveal>
          <div style={{ maxWidth: 1240, margin: "0 auto", background: `linear-gradient(120deg, ${C.primary}, #0891B2)`, borderRadius: 24, padding: "52px 32px", textAlign: "center" }}>
            <h2 className="qm-display" style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>Get health tips and offers in your inbox</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14.5, marginBottom: 28 }}>One email a week. Unsubscribe anytime.</p>
            <div style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ flex: 1, minWidth: 220, border: "none", outline: "none", padding: "13px 16px", borderRadius: 10, fontSize: 14 }} />
              <button onClick={() => setSubscribed(true)} className="qm-btn" style={{ background: "#111827", color: "#fff", border: "none", padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{subscribed ? "Subscribed" : "Subscribe"}</button>
            </div>
          </div>
        </Reveal>
      </section>
      <ChatBot theme={theme} dark={dark} />
    </>
  );
}