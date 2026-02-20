/**
 * Backend base URL for API and Socket.IO.
 * Production: Railway. Vite exposes env via import.meta.env.
 */
export const BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://rummy-backend-production.up.railway.app";
