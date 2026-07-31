


/* data.js
   Static content used across pages: marketing copy, categories, FAQs, etc.
   MEDICINES and ORDERS now live in PostgreSQL — fetched via src/api.js.
*/
import {
  ScanLine, Upload, MapPin, CreditCard, ShieldCheck, Truck, MessageCircle, Siren,
  Pill, HeartPulse, Sparkles, Baby, Sun, Snowflake, Cross, Award,
} from "lucide-react";

export const FEATURES = [
  { icon: ScanLine, title: "AI medicine scanner", desc: "Point your camera at any box and instantly find it in stock nearby." },
  { icon: Upload, title: "Prescription upload", desc: "Upload once — pharmacies verify and prepare your order in minutes." },
  { icon: MapPin, title: "Real-time tracking", desc: "Watch your rider move on the map from pickup to your doorstep." },
  { icon: CreditCard, title: "Secure payment", desc: "Cards, UPI or cash on delivery, protected end to end." },
  { icon: ShieldCheck, title: "Licensed pharmacies", desc: "Every partner is verified and audited before they join Quick Med." },
  { icon: Truck, title: "30–60 min delivery", desc: "From nearby pharmacies straight to your home, day or night." },
  { icon: MessageCircle, title: "Chat with pharmacy", desc: "Ask about dosage or substitutes directly before you order." },
  { icon: Siren, title: "Emergency delivery", desc: "Priority dispatch for urgent medicines, any hour of the day." },
];

export const STEPS = [
  { n: "01", title: "Upload prescription", desc: "Snap a photo or upload a PDF — takes less than a minute.", icon: Upload },
  { n: "02", title: "Choose medicines", desc: "Search, compare and add what you need to your cart.", icon: Pill },
  { n: "03", title: "Pharmacy verification", desc: "A licensed pharmacist checks and confirms your order.", icon: ShieldCheck },
  { n: "04", title: "Doorstep delivery", desc: "A rider brings it to you within 30–60 minutes.", icon: Truck },
];

export const CATEGORIES = [
  { name: "Pain Relief", icon: Pill }, { name: "Diabetes", icon: HeartPulse }, { name: "Heart Care", icon: HeartPulse },
  { name: "Skin Care", icon: Sparkles }, { name: "Baby Care", icon: Baby }, { name: "Vitamins", icon: Sun },
  { name: "Covid Essentials", icon: Snowflake }, { name: "First Aid", icon: Cross },
];

export const WHY = [
  { title: "Fast delivery", desc: "30–60 minutes, tracked door to door.", icon: Truck },
  { title: "Verified pharmacies", desc: "Every partner licensed and audited.", icon: ShieldCheck },
  { title: "Secure payments", desc: "PCI-compliant checkout, every time.", icon: CreditCard },
  { title: "AI scanner", desc: "Identify any medicine box in seconds.", icon: ScanLine },
  { title: "24/7 support", desc: "Pharmacists on chat, day and night.", icon: MessageCircle },
  { title: "Affordable prices", desc: "Transparent pricing, no hidden fees.", icon: Award },
];

export const TESTIMONIALS = [
  { name: "Ayesha Rahman", loc: "Dhaka", rating: 5, text: "Ordered my mother's heart medicine at midnight — it arrived in 40 minutes. The tracking map made all the difference." },
  { name: "Tanvir Ahmed", loc: "Chattogram", rating: 5, text: "The prescription upload is genuinely fast. A pharmacist messaged me within minutes to confirm the dosage." },
  { name: "Nusrat Jahan", loc: "Sylhet", rating: 4, text: "Love the AI scanner — I pointed my phone at an empty strip and it found the exact match nearby." },
];

export const FAQS = [
  { q: "How fast is delivery really?", a: "Most orders arrive within 30–60 minutes, depending on your distance from the nearest partner pharmacy and order verification time." },
  { q: "Do I need a prescription for every medicine?", a: "Only for medicines marked 'Prescription Required'. Over-the-counter items like vitamins or first aid can be ordered without one." },
  { q: "Is my payment information safe?", a: "Yes. All payments are processed through PCI-compliant gateways and we never store your full card details." },
  { q: "What if my medicine is out of stock?", a: "Our system suggests verified alternatives from your pharmacy, or automatically checks the next nearest partner." },
];