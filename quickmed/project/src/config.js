/* config.js
   Base URL of the backend server (see /backend in this project) that proxies
   AI requests to Anthropic so the API key never has to live in browser code.
   Change this to your deployed backend's URL in production, or set it to ""
   and use relative paths if the frontend and backend share a domain.
*/
export const API_BASE_URL = "http://localhost:5000";
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
