/* riderData.js
   Static/mock content for the rider login + dashboard pages.
   RIDER_ACCOUNTS stands in for a real rider-auth backend: swap
   authenticateRider() for an API call once one exists.
*/

export const RIDER_ACCOUNTS = [
  { id: "RID-2291", password: "rider123", name: "Rahim Uddin", vehicle: "Motorbike · Dhaka Metro", rating: 4.9, since: "Rider since Jan 2025" },
  { id: "RID-3350", password: "rider456", name: "Karim Hossain", vehicle: "Bicycle · Dhaka Metro", rating: 4.7, since: "Rider since Jun 2025" },
  { id: "RID-4108", password: "rider789", name: "Shafiq Islam", vehicle: "Motorbike · Chattogram", rating: 4.8, since: "Rider since Mar 2024" },
];

/* authenticateRider: looks up a rider by ID (case-insensitive) and checks the
   password. Returns the rider's public profile (no password) on success, or
   null on failure. */
export function authenticateRider(id, password) {
  const account = RIDER_ACCOUNTS.find((r) => r.id.toLowerCase() === id.trim().toLowerCase());
  if (!account || account.password !== password) return null;
  const { password: _pw, ...profile } = account;
  return profile;
}

export const RIDER_PROFILE = RIDER_ACCOUNTS[0];

const PROFILE_STORAGE_PREFIX = "quickmed_rider_profile_";

/* loadRiderProfile: merges a rider's base account info with any profile
   edits saved earlier in this browser (localStorage), so edits survive
   reloads and future logins on this device. Falls back gracefully if
   localStorage isn't available (private browsing, SSR, etc). */
export function loadRiderProfile(baseProfile) {
  const defaults = { phone: "", email: "", vehicleNumber: "", ...baseProfile };
  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_PREFIX + baseProfile.id);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch (e) {
    console.warn("Could not load saved rider profile:", e);
  }
  return defaults;
}

/* saveRiderProfile: persists a rider's edited profile fields to
   localStorage, keyed by rider ID. */
export function saveRiderProfile(profile) {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_PREFIX + profile.id, JSON.stringify(profile));
  } catch (e) {
    console.warn("Could not save rider profile:", e);
  }
}

export const INCOMING_REQUESTS = [
  {
    id: "REQ-771",
    pharmacy: "MediPlus Pharmacy, Gulshan 2",
    customer: "Farzana Akter",
    address: "House 14, Road 11, Banani",
    items: "Paracetamol 650mg x2, ORS Sachet x3",
    distance: "2.4 km",
    eta: "12 min",
    payout: 85,
  },
  {
    id: "REQ-772",
    pharmacy: "City Care Pharmacy, Dhanmondi 27",
    customer: "Imran Kabir",
    address: "Road 5A, Dhanmondi",
    items: "Metformin 500mg, Atorvastatin 10mg",
    distance: "3.1 km",
    eta: "16 min",
    payout: 95,
  },
  {
    id: "REQ-773",
    pharmacy: "Wellness Corner, Mirpur 10",
    customer: "Nusrat Jahan",
    address: "Section 6, Mirpur",
    items: "Vitamin D3 60K, Zincovit Tablets",
    distance: "1.8 km",
    eta: "9 min",
    payout: 70,
  },
];

export const COMPLETED_TODAY = [
  { id: "REQ-765", customer: "Tanvir Ahmed", items: "Cetirizine 10mg", payout: 60, time: "10:24 AM" },
  { id: "REQ-766", customer: "Ayesha Rahman", items: "Amoxicillin 500mg", payout: 78, time: "11:05 AM" },
];

/* DELIVERY_HISTORY: completed deliveries from before today, newest first —
   shown on the "Delivery history" tab together with today's completed list. */
export const DELIVERY_HISTORY = [
  { id: "REQ-758", customer: "Mahin Chowdhury", items: "Paracetamol 650mg", payout: 55, date: "28 Jul" },
  { id: "REQ-750", customer: "Sabrina Islam", items: "Vitamin D3 60K, Zincovit Tablets", payout: 88, date: "27 Jul" },
  { id: "REQ-741", customer: "Rafiq Ahmed", items: "Amoxicillin 500mg", payout: 64, date: "27 Jul" },
  { id: "REQ-733", customer: "Nadia Sultana", items: "Cetirizine 10mg, ORS Sachet x2", payout: 71, date: "26 Jul" },
  { id: "REQ-720", customer: "Jahid Hasan", items: "Atorvastatin 10mg", payout: 92, date: "25 Jul" },
  { id: "REQ-712", customer: "Farhana Yasmin", items: "Metformin 500mg", payout: 58, date: "24 Jul" },
  { id: "REQ-705", customer: "Tariq Anam", items: "Paracetamol 650mg x3", payout: 66, date: "23 Jul" },
];

/* WEEKLY_EARNINGS: the last 6 days before today, for the earnings bar chart.
   Today's bar is computed live in the component from actual completed deliveries. */
export const WEEKLY_EARNINGS = [
  { day: "Mon", amount: 420 },
  { day: "Tue", amount: 560 },
  { day: "Wed", amount: 380 },
  { day: "Thu", amount: 610 },
  { day: "Fri", amount: 495 },
  { day: "Sat", amount: 700 },
];

export const EARNINGS_TOTALS = { month: 6420, allTime: 28950 };