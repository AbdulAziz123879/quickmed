/* api.js
   Thin wrapper around fetch() for talking to the backend. Centralizes the
   base URL and basic error handling so pages don't repeat this boilerplate.
*/
import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}


export const api = {
  getMedicines: () => request("/api/medicines"),
  getMedicine: (id) => request(`/api/medicines/${id}`),
  loginRider: (id, password) =>
    request("/api/riders/login", { method: "POST", body: JSON.stringify({ id, password }) }),
  updateRider: (id, profile) =>
    request(`/api/riders/${id}`, { method: "PUT", body: JSON.stringify(profile) }),
  loginCustomer: (email, password) =>
    request("/api/customers/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  registerCustomer: (data) =>
    request("/api/customers/register", { method: "POST", body: JSON.stringify(data) }),
  getOrders: () => request("/api/orders"),
  createOrder: (order) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(order) }),
};