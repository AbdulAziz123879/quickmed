// /* data.js
//    Static content used across pages: catalog items, marketing copy, FAQs, etc.
// */
// import {
//   ScanLine, Upload, MapPin, CreditCard, ShieldCheck, Truck, MessageCircle, Siren,
//   Pill, HeartPulse, Sparkles, Baby, Sun, Snowflake, Cross, Award,
// } from "lucide-react";

// export const FEATURES = [
//   { icon: ScanLine, title: "AI medicine scanner", desc: "Point your camera at any box and instantly find it in stock nearby." },
//   { icon: Upload, title: "Prescription upload", desc: "Upload once — pharmacies verify and prepare your order in minutes." },
//   { icon: MapPin, title: "Real-time tracking", desc: "Watch your rider move on the map from pickup to your doorstep." },
//   { icon: CreditCard, title: "Secure payment", desc: "Cards, UPI or cash on delivery, protected end to end." },
//   { icon: ShieldCheck, title: "Licensed pharmacies", desc: "Every partner is verified and audited before they join Quick Med." },
//   { icon: Truck, title: "30–60 min delivery", desc: "From nearby pharmacies straight to your home, day or night." },
//   { icon: MessageCircle, title: "Chat with pharmacy", desc: "Ask about dosage or substitutes directly before you order." },
//   { icon: Siren, title: "Emergency delivery", desc: "Priority dispatch for urgent medicines, any hour of the day." },
// ];

// export const STEPS = [
//   { n: "01", title: "Upload prescription", desc: "Snap a photo or upload a PDF — takes less than a minute.", icon: Upload },
//   { n: "02", title: "Choose medicines", desc: "Search, compare and add what you need to your cart.", icon: Pill },
//   { n: "03", title: "Pharmacy verification", desc: "A licensed pharmacist checks and confirms your order.", icon: ShieldCheck },
//   { n: "04", title: "Doorstep delivery", desc: "A rider brings it to you within 30–60 minutes.", icon: Truck },
// ];

// export const MEDICINES = [
//   { id: 1, name: "Paracetamol 650mg", brand: "Cipla", price: 32, mrp: 45, rating: 4.6, rx: false, stock: "In stock", tag: "Pain Relief", uses: "Fever and mild to moderate pain relief.", dose: "1 tablet every 6–8 hours after food, not exceeding 4 tablets a day.", warnings: "Avoid with liver disease. Do not exceed the recommended dose." },
//   { id: 2, name: "Metformin 500mg", brand: "Sun Pharma", price: 58, mrp: 72, rating: 4.7, rx: true, stock: "In stock", tag: "Diabetes", uses: "Manages blood sugar in type 2 diabetes.", dose: "1 tablet with dinner, or as prescribed by your doctor.", warnings: "Requires prescription. May cause mild stomach upset initially." },
//   { id: 3, name: "Atorvastatin 10mg", brand: "Dr Reddy's", price: 89, mrp: 110, rating: 4.5, rx: true, stock: "Low stock", tag: "Heart Care", uses: "Lowers cholesterol and reduces heart disease risk.", dose: "1 tablet daily at night, or as prescribed.", warnings: "Requires prescription. Avoid grapefruit juice." },
//   { id: 4, name: "Cetirizine 10mg", brand: "Mankind", price: 21, mrp: 30, rating: 4.4, rx: false, stock: "In stock", tag: "Skin Care", uses: "Relieves allergy symptoms like itching and sneezing.", dose: "1 tablet daily, preferably at night.", warnings: "May cause mild drowsiness." },
//   { id: 5, name: "Vitamin D3 60K", brand: "Abbott", price: 112, mrp: 140, rating: 4.8, rx: false, stock: "In stock", tag: "Vitamins", uses: "Supports bone health and immunity.", dose: "1 sachet weekly, or as advised.", warnings: "Consult a doctor before long-term use." },
//   { id: 6, name: "Zincovit Tablets", brand: "Apex", price: 95, mrp: 120, rating: 4.6, rx: false, stock: "In stock", tag: "Vitamins", uses: "Multivitamin and mineral supplement.", dose: "1 tablet daily after food.", warnings: "Keep out of reach of children." },
//   { id: 7, name: "Amoxicillin 500mg", brand: "GSK", price: 64, mrp: 80, rating: 4.3, rx: true, stock: "In stock", tag: "First Aid", uses: "Treats bacterial infections.", dose: "1 capsule every 8 hours, complete the full course.", warnings: "Requires prescription. Inform your doctor of any penicillin allergy." },
//   { id: 8, name: "ORS Sachet Pack", brand: "FDC", price: 18, mrp: 25, rating: 4.7, rx: false, stock: "In stock", tag: "Baby Care", uses: "Prevents dehydration from diarrhea or vomiting.", dose: "Dissolve 1 sachet in 200ml clean water, sip through the day.", warnings: "Discard the solution after 24 hours." },
// ];

// export const CATEGORIES = [
//   { name: "Pain Relief", icon: Pill }, { name: "Diabetes", icon: HeartPulse }, { name: "Heart Care", icon: HeartPulse },
//   { name: "Skin Care", icon: Sparkles }, { name: "Baby Care", icon: Baby }, { name: "Vitamins", icon: Sun },
//   { name: "Covid Essentials", icon: Snowflake }, { name: "First Aid", icon: Cross },
// ];

// export const WHY = [
//   { title: "Fast delivery", desc: "30–60 minutes, tracked door to door.", icon: Truck },
//   { title: "Verified pharmacies", desc: "Every partner licensed and audited.", icon: ShieldCheck },
//   { title: "Secure payments", desc: "PCI-compliant checkout, every time.", icon: CreditCard },
//   { title: "AI scanner", desc: "Identify any medicine box in seconds.", icon: ScanLine },
//   { title: "24/7 support", desc: "Pharmacists on chat, day and night.", icon: MessageCircle },
//   { title: "Affordable prices", desc: "Transparent pricing, no hidden fees.", icon: Award },
// ];

// export const TESTIMONIALS = [
//   { name: "Ayesha Rahman", loc: "Dhaka", rating: 5, text: "Ordered my mother's heart medicine at midnight — it arrived in 40 minutes. The tracking map made all the difference." },
//   { name: "Tanvir Ahmed", loc: "Chattogram", rating: 5, text: "The prescription upload is genuinely fast. A pharmacist messaged me within minutes to confirm the dosage." },
//   { name: "Nusrat Jahan", loc: "Sylhet", rating: 4, text: "Love the AI scanner — I pointed my phone at an empty strip and it found the exact match nearby." },
// ];

// export const FAQS = [
//   { q: "How fast is delivery really?", a: "Most orders arrive within 30–60 minutes, depending on your distance from the nearest partner pharmacy and order verification time." },
//   { q: "Do I need a prescription for every medicine?", a: "Only for medicines marked 'Prescription Required'. Over-the-counter items like vitamins or first aid can be ordered without one." },
//   { q: "Is my payment information safe?", a: "Yes. All payments are processed through PCI-compliant gateways and we never store your full card details." },
//   { q: "What if my medicine is out of stock?", a: "Our system suggests verified alternatives from your pharmacy, or automatically checks the next nearest partner." },
// ];

// export const ORDERS = [
//   { id: "QM-10234", date: "22 Jul", items: "Paracetamol 650mg + 2 more", total: 156, status: "Delivered" },
//   { id: "QM-10221", date: "18 Jul", items: "Vitamin D3 60K", total: 112, status: "Delivered" },
//   { id: "QM-10198", date: "11 Jul", items: "Metformin 500mg + 1 more", total: 210, status: "Delivered" },
// ];



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